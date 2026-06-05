"use client";

import UserEmailCodeStep from "@/widgets/profile-settings/ui/user/UserEmailCodeStep";
import UserPasswordStep from "@/widgets/profile-settings/ui/user/UserPasswordStep";
import UserSendCodePrompt from "@/widgets/profile-settings/ui/user/UserSendCodePrompt";
import UserSummary from "@/widgets/profile-settings/ui/user/UserSummary";
import { useUserBlock } from "@/widgets/profile-settings/model/useUserBlock";

export default function UserBlock() {
  const user = useUserBlock();

  return (
    <div className="profile-section profile-user-section">
      <div className="profile-section-title">Пользователь</div>

      <UserSummary
        nick={user.demoUser.nick}
        email={user.demoUser.email}
        flow={user.flow}
        onStartChangePassword={user.startChangePassword}
      />

      {user.flow === "confirm-send" ? (
        <UserSendCodePrompt
          email={user.demoUser.email}
          onSend={user.sendEmailCode}
          onCancel={user.resetFlow}
        />
      ) : null}

      {user.flow === "code" ? (
        <UserEmailCodeStep
          emailCode={user.emailCode}
          resendCooldownSec={user.resendCooldownSec}
          onEmailCodeChange={user.setEmailCode}
          onConfirm={user.confirmEmailCode}
          onDismiss={user.resetFlow}
          onResend={user.resendEmailCode}
        />
      ) : null}

      {user.flow === "password" ? (
        <UserPasswordStep
          password={user.password}
          passwordConfirm={user.passwordConfirm}
          passwordVisible={user.passwordVisible}
          passwordConfirmVisible={user.passwordConfirmVisible}
          passwordStrength={user.passwordStrength}
          passwordsMismatch={user.passwordsMismatch}
          canConfirm={user.canConfirmPassword}
          onPasswordChange={user.setPassword}
          onPasswordConfirmChange={user.setPasswordConfirm}
          onTogglePasswordVisible={user.togglePasswordVisible}
          onTogglePasswordConfirmVisible={user.togglePasswordConfirmVisible}
          onConfirm={user.confirmNewPassword}
        />
      ) : null}
    </div>
  );
}
