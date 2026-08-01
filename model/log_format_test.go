package model

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/QuantumNous/new-api/common"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestFormatUserLogsStripsQuotaSaturation verifies the admin-only quota
// saturation marker (nested under other.admin_info) is removed for non-admin
// log views, since formatUserLogs strips the whole admin_info object.
func TestFormatUserLogsStripsQuotaSaturation(t *testing.T) {
	other := common.MapToJsonStr(map[string]interface{}{
		"model_price": 0.004,
		"admin_info": map[string]interface{}{
			"quota_saturation": map[string]interface{}{
				"op":      "QuotaFromDecimal",
				"kind":    "overflow",
				"clamped": common.MaxQuota,
			},
		},
	})
	logs := []*Log{{Other: other}}

	formatUserLogs(logs, 0, common.RoleCommonUser)

	parsed, err := common.StrToMap(logs[0].Other)
	require.NoError(t, err)
	_, hasAdminInfo := parsed["admin_info"]
	require.False(t, hasAdminInfo, "admin_info (and nested quota_saturation) must be stripped for non-admin views")
	// Non-admin billing fields remain visible.
	require.Contains(t, parsed, "model_price")
}

func TestFormatUserLogsStandardizesUpstreamErrors(t *testing.T) {
	tests := []struct {
		name           string
		statusCode     interface{}
		wantStatusCode int
		wantErrorCode  string
		wantMessage    string
	}{
		{
			name:           "invalid upstream key",
			statusCode:     401,
			wantStatusCode: 401,
			wantErrorCode:  standardErrorCodeKeyInvalid,
			wantMessage:    standardErrorMessageKeyInvalid,
		},
		{
			name:           "upstream quota exhausted",
			statusCode:     402,
			wantStatusCode: 402,
			wantErrorCode:  standardErrorCodeResourceExhausted,
			wantMessage:    standardErrorMessageResource,
		},
		{
			name:           "upstream rate limited with legacy string status",
			statusCode:     "429",
			wantStatusCode: 429,
			wantErrorCode:  standardErrorCodeRateLimited,
			wantMessage:    standardErrorMessageRateLimited,
		},
		{
			name:           "upstream server failure",
			statusCode:     503,
			wantStatusCode: 502,
			wantErrorCode:  standardErrorCodeServiceUnavailable,
			wantMessage:    standardErrorMessageService,
		},
		{
			name:           "unclassified upstream failure",
			statusCode:     403,
			wantStatusCode: 500,
			wantErrorCode:  standardErrorCodeInternal,
			wantMessage:    standardErrorMessageInternal,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rawContent := "provider-a balance exhausted: sk-upstream-secret"
			other := common.MapToJsonStr(map[string]interface{}{
				"status_code":  tt.statusCode,
				"error_type":   "openai_error",
				"error_code":   "insufficient_quota",
				"channel_id":   17,
				"channel_name": "provider-a",
				"channel_type": 1,
				"request_path": "/v1/chat/completions",
				"raw_response": map[string]interface{}{
					"message": "provider-a internal failure",
				},
				"admin_info": map[string]interface{}{
					"use_channel": []int{17, 18},
				},
			})
			logs := []*Log{{
				Type:              LogTypeError,
				Content:           rawContent,
				ChannelId:         17,
				ChannelName:       "provider-a",
				UpstreamRequestId: "upstream-request-id",
				Other:             other,
			}}

			formatUserLogs(logs, 0, common.RoleCommonUser)

			assert.Equal(t, tt.wantMessage, logs[0].Content)
			assert.Zero(t, logs[0].ChannelId)
			assert.Empty(t, logs[0].ChannelName)
			assert.Empty(t, logs[0].UpstreamRequestId)

			parsed, err := common.StrToMap(logs[0].Other)
			require.NoError(t, err)
			assert.Equal(t, standardErrorType, parsed["error_type"])
			assert.Equal(t, tt.wantErrorCode, parsed["error_code"])
			assert.Equal(t, float64(tt.wantStatusCode), parsed["status_code"])
			assert.Equal(t, "/v1/chat/completions", parsed["request_path"])
			for _, key := range []string{"channel_id", "channel_name", "channel_type", "raw_response", "admin_info"} {
				assert.NotContains(t, parsed, key)
			}
			assert.NotContains(t, logs[0].Other, "provider-a")
			assert.NotContains(t, logs[0].Other, "insufficient_quota")
			assert.NotContains(t, fmt.Sprintf("%s %s", logs[0].Content, logs[0].Other), "sk-upstream-secret")
		})
	}
}

func TestFormatUserLogsPreservesRawErrorsForPrivilegedRoles(t *testing.T) {
	for _, role := range []int{common.RoleAdminUser, common.RoleRootUser} {
		t.Run(fmt.Sprintf("role_%d", role), func(t *testing.T) {
			rawOther := common.MapToJsonStr(map[string]interface{}{
				"status_code":  402,
				"error_type":   "openai_error",
				"error_code":   "insufficient_quota",
				"channel_name": "provider-a",
			})
			logs := []*Log{{
				Type:              LogTypeError,
				Content:           "provider-a balance exhausted",
				ChannelId:         17,
				ChannelName:       "provider-a",
				UpstreamRequestId: "upstream-request-id",
				Other:             rawOther,
			}}

			formatUserLogs(logs, 0, role)

			assert.Equal(t, "provider-a balance exhausted", logs[0].Content)
			assert.Equal(t, 17, logs[0].ChannelId)
			assert.Equal(t, "provider-a", logs[0].ChannelName)
			assert.Equal(t, "upstream-request-id", logs[0].UpstreamRequestId)
			assert.JSONEq(t, rawOther, logs[0].Other)
		})
	}
}

func TestFormatUserLogsMapsLocalQuotaErrors(t *testing.T) {
	other := common.MapToJsonStr(map[string]interface{}{
		"status_code":  403,
		"error_type":   "new_api_error",
		"error_code":   "pre_consume_token_quota_failed",
		"request_path": "/v1/responses",
	})
	logs := []*Log{{
		Type:    LogTypeError,
		Content: "status_code=403, token quota is not enough, token remain quota: ¥0.013528, need quota: ¥0.015000",
		Other:   other,
	}}

	formatUserLogs(logs, 0, common.RoleCommonUser)

	assert.Equal(t, standardErrorMessageResource, logs[0].Content)
	parsed, err := common.StrToMap(logs[0].Other)
	require.NoError(t, err)
	assert.Equal(t, standardErrorCodeResourceExhausted, parsed["error_code"])
	assert.Equal(t, float64(http.StatusForbidden), parsed["status_code"])
	assert.NotContains(t, logs[0].Content, "token remain quota")
}
