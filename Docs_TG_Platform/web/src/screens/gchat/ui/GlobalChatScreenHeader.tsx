"use client";

import { ContextMenu } from "@/shared/ui/context-menu";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import {
  MenuIconTrash,
  PageHeader,
  PageHeaderMenuButton,
} from "@/widgets/page-header";
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
    <PageHeader
      left={
        <>
          <PageHeaderMenuButton />
          <Breadcrumb
            items={[
              { label: "Чаты", onClick: navigateBackToChats },
              { label: chat?.title || "—", current: true },
            ]}
          />
        </>
      }
      onBack={navigateBackToChats}
      actions={
        omnichannel ? null : (
          <div className="page-header-actions--desktop">
            <ContextMenu items={[deleteItem]} />
          </div>
        )
      }
      overflowItems={[
        {
          ...deleteItem,
          hidden: omnichannel || !chat,
        },
      ]}
    />
  );
}
