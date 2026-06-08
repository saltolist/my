import { withTelegramDomainSync } from "@/app/model/store/domain/helpers";
import type { DomainAction } from "@/app/model/store/domain/actions";
import type { DomainState } from "@/app/model/store/domain/types";

export function handleProfileAction(state: DomainState, action: DomainAction): DomainState | null {
  switch (action.type) {
    case "UPDATE_CHANNEL_PROFILE":
      return { ...state, channelProfileConfig: action.config };
    case "UPDATE_AI_CONFIG":
      return { ...state, aiProfileConfig: action.config };
    case "UPDATE_TELEGRAM_CONFIG":
      return { ...state, ...withTelegramDomainSync(state, action.config) };
    default:
      return null;
  }
}
