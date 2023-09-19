import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { ModalProps } from "../types";

export default function Notify({
    title,
    content,
    ...props
}: ModalProps<"notify">) {
    return (
        <Modal
            {...props}
            title={title}
            actions={[
                {
                    onClick: noopTrue,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                },
            ]}>
            {content}
        </Modal>
    );
}
