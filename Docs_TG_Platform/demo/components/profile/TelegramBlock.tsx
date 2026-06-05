"use client";

import TelegramApiCredentialsSection from "@/components/profile/telegram/TelegramApiCredentialsSection";
import TelegramAuthSection from "@/components/profile/telegram/TelegramAuthSection";
import TelegramChannelSection from "@/components/profile/telegram/TelegramChannelSection";
import TelegramOmnibotSection from "@/components/profile/telegram/TelegramOmnibotSection";
import TelegramStatusHeader from "@/components/profile/telegram/TelegramStatusHeader";
import { useTelegramBlock } from "@/lib/hooks/useTelegramBlock";

export default function TelegramBlock() {
  const tg = useTelegramBlock();

  return (
    <div className="profile-section">
      <div className="profile-section-title">Telegram</div>

      <TelegramStatusHeader
        status={tg.status}
        isAuthorized={tg.isAuthorized}
        isConnected={tg.isConnected}
        syncing={tg.syncing}
        onReset={tg.reset}
      />

      <div className="telegram-form-grid">
        <TelegramApiCredentialsSection
          cfg={tg.cfg}
          apiChangedFromSaved={tg.apiChangedFromSaved}
          apiHashVisible={tg.apiHashVisible}
          onApiIdChange={(apiId) => tg.update({ apiId })}
          onApiHashChange={(apiHash) => tg.update({ apiHash })}
          onToggleApiHashVisible={() => tg.setApiHashVisible((v) => !v)}
          onSave={tg.saveApiCredentials}
          onCancel={tg.cancelApiCredentials}
        />

        <TelegramAuthSection
          cfg={tg.cfg}
          codeHidden={tg.codeHidden}
          code={tg.code}
          resendCooldownSec={tg.resendCooldownSec}
          sendCodeDisabled={tg.sendCodeDisabled}
          onPhoneChange={(phone) => tg.update({ phone })}
          onCodeChange={tg.setCode}
          onStartAuth={tg.startAuth}
          onConfirmCode={tg.confirmCode}
          onCancelCodeEntry={tg.cancelCodeEntry}
          onResendCode={tg.resendCode}
        />
      </div>

      <TelegramChannelSection
        cfg={tg.cfg}
        isAuthorized={tg.isAuthorized}
        isConnected={tg.isConnected}
        connectChannelDisabled={tg.connectChannelDisabled}
        onChannelChange={(channel) => tg.update({ channel })}
        onConnectChannel={tg.connectChannel}
      />

      <div className="telegram-section-divider" aria-hidden />

      <TelegramOmnibotSection
        cfg={tg.cfg}
        isBotConnected={tg.isBotConnected}
        botApiTokenVisible={tg.botApiTokenVisible}
        addBotDisabled={tg.addBotDisabled}
        onBotTokenChange={(botApiToken) => tg.update({ botApiToken })}
        onToggleBotTokenVisible={() => tg.setBotApiTokenVisible((v) => !v)}
        onConnectBot={tg.connectBot}
      />
    </div>
  );
}
