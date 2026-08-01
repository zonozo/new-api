package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/relaykit/types"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestResetStatusCode(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name             string
		statusCode       int
		statusCodeConfig string
		expectedCode     int
	}{
		{
			name:             "map string value",
			statusCode:       429,
			statusCodeConfig: `{"429":"503"}`,
			expectedCode:     503,
		},
		{
			name:             "map int value",
			statusCode:       429,
			statusCodeConfig: `{"429":503}`,
			expectedCode:     503,
		},
		{
			name:             "skip invalid string value",
			statusCode:       429,
			statusCodeConfig: `{"429":"bad-code"}`,
			expectedCode:     429,
		},
		{
			name:             "skip status code 200",
			statusCode:       200,
			statusCodeConfig: `{"200":503}`,
			expectedCode:     200,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			newAPIError := &types.NewAPIError{
				StatusCode: tc.statusCode,
			}
			ResetStatusCode(newAPIError, tc.statusCodeConfig)
			require.Equal(t, tc.expectedCode, newAPIError.StatusCode)
		})
	}
}

func TestRelayErrorHandlerTruncatesInvalidJSONBodyInLog(t *testing.T) {
	withDebugEnabled(t, false)

	body := strings.Repeat("b", common.LocalLogContentLimit+256)
	var logBuffer bytes.Buffer

	common.LogWriterMu.Lock()
	oldWriter := gin.DefaultErrorWriter
	gin.DefaultErrorWriter = &logBuffer
	common.LogWriterMu.Unlock()
	t.Cleanup(func() {
		common.LogWriterMu.Lock()
		gin.DefaultErrorWriter = oldWriter
		common.LogWriterMu.Unlock()
	})

	resp := &http.Response{
		StatusCode: http.StatusInternalServerError,
		Body:       io.NopCloser(strings.NewReader(body)),
	}

	newAPIError := RelayErrorHandler(context.Background(), resp, false)

	require.NotNil(t, newAPIError)
	require.Equal(t, "bad response status code 500", newAPIError.Error())
	require.Contains(t, logBuffer.String(), "[truncated")
	require.Contains(t, logBuffer.String(), fmt.Sprintf("original_length=%d", len(body)))
	require.NotContains(t, logBuffer.String(), strings.Repeat("b", common.LocalLogContentLimit+1))
}

func TestRelayErrorHandlerKeepsStructuredErrorMessage(t *testing.T) {
	message := strings.Repeat("c", common.LocalLogContentLimit+256)
	body := `{"message":"` + message + `"}`
	resp := &http.Response{
		StatusCode: http.StatusInternalServerError,
		Body:       io.NopCloser(strings.NewReader(body)),
	}

	newAPIError := RelayErrorHandler(context.Background(), resp, false)

	require.NotNil(t, newAPIError)
	require.Equal(t, message, newAPIError.Error())
}

func TestRelayErrorHandlerKeepsOpenAIErrorMessage(t *testing.T) {
	message := strings.Repeat("d", common.LocalLogContentLimit+256)
	body := `{"error":{"message":"` + message + `","type":"server_error","code":"server_error"}}`
	resp := &http.Response{
		StatusCode: http.StatusInternalServerError,
		Body:       io.NopCloser(strings.NewReader(body)),
	}

	newAPIError := RelayErrorHandler(context.Background(), resp, false)

	require.NotNil(t, newAPIError)
	require.Equal(t, message, newAPIError.Error())
}

func TestRelayErrorHandlerKeepsInvalidJSONBodyInDebugLog(t *testing.T) {
	withDebugEnabled(t, true)

	body := strings.Repeat("e", common.LocalLogContentLimit+256)
	var logBuffer bytes.Buffer

	common.LogWriterMu.Lock()
	oldWriter := gin.DefaultErrorWriter
	gin.DefaultErrorWriter = &logBuffer
	common.LogWriterMu.Unlock()
	t.Cleanup(func() {
		common.LogWriterMu.Lock()
		gin.DefaultErrorWriter = oldWriter
		common.LogWriterMu.Unlock()
	})

	resp := &http.Response{
		StatusCode: http.StatusInternalServerError,
		Body:       io.NopCloser(strings.NewReader(body)),
	}

	newAPIError := RelayErrorHandler(context.Background(), resp, false)

	require.NotNil(t, newAPIError)
	require.NotContains(t, logBuffer.String(), "[truncated")
	require.Contains(t, logBuffer.String(), body)
}

func TestUserFacingErrorHidesUpstreamDetails(t *testing.T) {
	tests := []struct {
		name       string
		rawStatus  int
		wantStatus int
		wantCode   types.ErrorCode
		wantText   string
	}{
		{name: "invalid key", rawStatus: http.StatusUnauthorized, wantStatus: http.StatusUnauthorized, wantCode: "KEY_INVALID", wantText: "Key invalid"},
		{name: "upstream quota", rawStatus: http.StatusPaymentRequired, wantStatus: http.StatusPaymentRequired, wantCode: "RESOURCE_EXHAUSTED", wantText: "Insufficient resources"},
		{name: "rate limited", rawStatus: http.StatusTooManyRequests, wantStatus: http.StatusTooManyRequests, wantCode: "RATE_LIMITED", wantText: "Too many requests, please try again later"},
		{name: "server failure", rawStatus: http.StatusBadGateway, wantStatus: http.StatusBadGateway, wantCode: "SERVICE_UNAVAILABLE", wantText: "Upstream service failure, please try again later"},
		{name: "unknown upstream status", rawStatus: http.StatusForbidden, wantStatus: http.StatusInternalServerError, wantCode: "INTERNAL_ERROR", wantText: "Internal error, please try again later"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			raw := types.WithOpenAIError(types.OpenAIError{
				Message: "token quota is not enough: token remain quota: secret, url: http://internal",
				Type:    "upstream_error",
				Code:    "provider_internal",
			}, tt.rawStatus)

			safe := UserFacingError(raw)
			require.Equal(t, tt.wantStatus, safe.StatusCode)
			safeResponse := safe.ToOpenAIError()
			require.Equal(t, tt.wantCode, safe.GetErrorCode())
			require.Equal(t, tt.wantText, safeResponse.Message)
			require.NotContains(t, safeResponse.Message, "token quota")
			require.NotContains(t, safeResponse.Message, "internal")
		})
	}
}

func TestUserFacingErrorMapsLocalQuotaFailure(t *testing.T) {
	raw := types.NewErrorWithStatusCode(
		errors.New("token quota is not enough, token remain quota: secret, need quota: secret"),
		types.ErrorCodePreConsumeTokenQuotaFailed,
		http.StatusForbidden,
	)

	safe := UserFacingError(raw)
	require.Equal(t, http.StatusForbidden, safe.StatusCode)
	require.Equal(t, types.ErrorCode("RESOURCE_EXHAUSTED"), safe.GetErrorCode())
	require.Equal(t, "Insufficient resources", safe.ToOpenAIError().Message)
	require.Contains(t, raw.Error(), "token remain quota")
}

func TestUserFacingErrorPreservesClientValidation(t *testing.T) {
	raw := types.NewError(errors.New("invalid field: max_tokens"), types.ErrorCodeInvalidRequest)

	require.Same(t, raw, UserFacingError(raw))
}

func withDebugEnabled(t *testing.T, enabled bool) {
	t.Helper()

	oldDebug := common.DebugEnabled
	common.DebugEnabled = enabled
	t.Cleanup(func() {
		common.DebugEnabled = oldDebug
	})
}
