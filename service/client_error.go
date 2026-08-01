package service

import (
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/relaykit/types"
)

const (
	clientErrorTypeStandard           = "standard_error"
	clientErrorCodeKeyInvalid         = "KEY_INVALID"
	clientErrorCodeResourceExhausted  = "RESOURCE_EXHAUSTED"
	clientErrorCodeRateLimited        = "RATE_LIMITED"
	clientErrorCodeServiceUnavailable = "SERVICE_UNAVAILABLE"
	clientErrorCodeInternal           = "INTERNAL_ERROR"

	clientErrorMessageKeyInvalid         = "Key invalid"
	clientErrorMessageResourceExhausted  = "Insufficient resources"
	clientErrorMessageRateLimited        = "Too many requests, please try again later"
	clientErrorMessageServiceUnavailable = "Upstream service failure, please try again later"
	clientErrorMessageInternal           = "Internal error, please try again later"
)

// UserFacingError replaces provider and billing internals with a stable error
// contract. The original NewAPIError remains unchanged for admin diagnostics,
// retry decisions, refunds, and usage-log recording.
func UserFacingError(err *types.NewAPIError) *types.NewAPIError {
	if err == nil {
		return nil
	}
	if preserveClientError(err) {
		return err
	}

	statusCode := http.StatusInternalServerError
	code := clientErrorCodeInternal
	message := clientErrorMessageInternal

	switch {
	case isResourceExhaustedError(err):
		statusCode = err.StatusCode
		if statusCode < 100 || statusCode > 599 {
			statusCode = http.StatusForbidden
		}
		code = clientErrorCodeResourceExhausted
		message = clientErrorMessageResourceExhausted
	case err.StatusCode == http.StatusUnauthorized:
		statusCode = http.StatusUnauthorized
		code = clientErrorCodeKeyInvalid
		message = clientErrorMessageKeyInvalid
	case err.StatusCode == http.StatusPaymentRequired:
		statusCode = http.StatusPaymentRequired
		code = clientErrorCodeResourceExhausted
		message = clientErrorMessageResourceExhausted
	case err.StatusCode == http.StatusTooManyRequests:
		statusCode = http.StatusTooManyRequests
		code = clientErrorCodeRateLimited
		message = clientErrorMessageRateLimited
	case err.StatusCode >= http.StatusInternalServerError && err.StatusCode <= 599:
		statusCode = http.StatusBadGateway
		code = clientErrorCodeServiceUnavailable
		message = clientErrorMessageServiceUnavailable
	}

	return types.WithOpenAIError(
		types.OpenAIError{Message: message, Type: clientErrorTypeStandard, Code: code},
		statusCode,
		types.ErrOptionWithSkipRetry(),
	)
}

func preserveClientError(err *types.NewAPIError) bool {
	switch err.GetErrorCode() {
	case types.ErrorCodeInvalidRequest,
		types.ErrorCodeSensitiveWordsDetected,
		types.ErrorCodeCountTokenFailed,
		types.ErrorCodeModelPriceError,
		types.ErrorCodeReadRequestBodyFailed,
		types.ErrorCodeConvertRequestFailed,
		types.ErrorCodeAccessDenied,
		types.ErrorCodeBadRequestBody:
		return true
	default:
		return false
	}
}

func isResourceExhaustedError(err *types.NewAPIError) bool {
	if err == nil {
		return false
	}
	if err.GetErrorCode() == types.ErrorCodeInsufficientUserQuota {
		return true
	}
	if err.GetErrorCode() != types.ErrorCodePreConsumeTokenQuotaFailed {
		return false
	}
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "quota is not enough") ||
		strings.Contains(message, "quota insufficient")
}
