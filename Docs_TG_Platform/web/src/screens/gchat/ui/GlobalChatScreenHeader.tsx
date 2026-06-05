"use client";

import { ContextMenu } from "@/shared/ui/context-menu";
import { MenuIconTrash } from "@/widgets/page-header/ui/HeaderMenuIcons";
import PageHeaderMenuButton from "@/widgets/page-header/ui/PageHeaderMenuButton";
import PageHeaderOverflow from "@/widgets/page-header/ui/PageHeaderOverflow";
import type { GlobalChatScreenState } from "@/screens/gchat/model/useGlobalChatScreen";

type Props = Pick<
  GlobalChatScreenState,
  "chat" | "omnichannel" | "navigateBackToChats" | "deleteChat"
>;

export default function GlobalChatScreenHeader({
  chat,
  omnichannel,
  navigateBackToChats,
  deleteChat,
}: Props) {
  const deleteItem = {
    label: "Удалить чат",
    icon: <MenuIconTrash />,
    danger: true as const,
    onClick: deleteChat,
  };

  return (
    <div className="page-header">
      <div className="page-header-left">
        <PageHeaderMenuButton />
        <div className="breadcrumb">
          <span className="bc-link" onClick={navigateBackToChats}>
            Чаты
          </span>
          <span className="bc-sep">/</span>
          <span className="crumb-current">{chat?.title || "—"}</span>
        </div>
      </div>
      <div className="page-header-center" aria-hidden="true" />
      <div className="page-header-right">
        <div className="page-header-actions--desktop">
          <button
            className="btn btn-ghost btn-sm"
            onClick={navigateBackToChats}
            type="button"
          >
            ← Назад
          </button>
          {omnichannel ? null : <ContextMenu items={[deleteItem]} />}
        </div>
        <PageHeaderOverflow
          className="page-header-actions--mobile"
          items={[
            {
              ...deleteItem,
              hidden: omnichannel || !chat,
            },
          ]}
        />
      </div>
    </div>
  );
}
