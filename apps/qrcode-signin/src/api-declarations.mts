export const enum ApiCodeSignInIdentifierType {
    user = 'user',
    customerCard = 'customer-card',
}

// Token sign in
export interface ApiTokenSignInRequestBody {
    token: string;
    code: string;
    identifierType: ApiCodeSignInIdentifierType;
}

export interface ApiTokenSignInResponseBody {
    success: boolean;
    errorMessage?: string | null;
    remainingSeconds?: number | null;
    identifier?: string | null;
    identifierType?: ApiCodeSignInIdentifierType | null;
}


// Credentials sign in
export interface ApiCredentialsSignInRequestBody {
    identifier: string;
    passwordHash: string;
    code: string;
    identifierType: ApiCodeSignInIdentifierType;
}

export interface ApiCredentialsSignInResponseBody {
    success: boolean;
    errorMessage?: string | null;
    token?: string | null;
    remainingSeconds?: number | null;
    identifier?: string | null;
    identifierType?: ApiCodeSignInIdentifierType | null;
}