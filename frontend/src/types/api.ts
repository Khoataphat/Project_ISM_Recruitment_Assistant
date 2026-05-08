export type ApiValidationIssue = {
  field: string
  message: string
}

export type ApiSuccessEnvelope<T> = {
  status: 'success'
  data?: T
  message?: string
}

export type ApiErrorEnvelope = {
  status: 'error'
  message?: string
  errors?: ApiValidationIssue[]
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope
