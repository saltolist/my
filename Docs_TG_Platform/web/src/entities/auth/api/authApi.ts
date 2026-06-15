import { apiRequest } from "@/shared/api/httpClient";
import { API_V1 } from "@/shared/config/basePath";
import type {
  AuthSession,
  ForgotPasswordResetDto,
  ForgotPasswordSendCodeDto,
  LoginDto,
  RegisterSendCodeDto,
  RegisterVerifyDto,
} from "@/shared/lib/auth/types";

const v1 = API_V1;

export async function login(dto: LoginDto): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${v1}/auth/login`, { method: "POST", body: dto });
}

export async function logout(): Promise<void> {
  await apiRequest<void>(`${v1}/auth/logout`, { method: "POST" });
}

export async function registerSendCode(dto: RegisterSendCodeDto): Promise<void> {
  await apiRequest<void>(`${v1}/auth/register/send-code`, { method: "POST", body: dto });
}

export async function registerVerify(dto: RegisterVerifyDto): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${v1}/auth/register/verify`, { method: "POST", body: dto });
}

export async function forgotPasswordSendCode(dto: ForgotPasswordSendCodeDto): Promise<void> {
  await apiRequest<void>(`${v1}/auth/forgot-password/send-code`, { method: "POST", body: dto });
}

export async function forgotPasswordReset(dto: ForgotPasswordResetDto): Promise<void> {
  await apiRequest<void>(`${v1}/auth/forgot-password/reset`, { method: "POST", body: dto });
}
