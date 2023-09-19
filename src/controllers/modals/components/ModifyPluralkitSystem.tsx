import { PKAPI } from "pkapi.js";

import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import { modalController } from "../ModalController";
import { ModalProps } from "../types";

/**
 * Modify PluralKit ID modal
 */
export default function ModifyPluralkitSystem({
    ...props
}: ModalProps<"modify_pk_sys">) {
    const state = useApplicationState();
    const settings = state.settings;

    return (
        <ModalForm
            {...props}
            title="Set PluralKit System Details"
            schema={{
                id: "text",
                token: "text",
            }}
            defaults={{
                id: settings.get("nonsense:system:id"),
                token: settings.get("nonsense:system:token"),
            }}
            data={{
                id: {
                    field: "System ID",
                },
                token: {
                    field: "Token (Optional)",
                },
            }}
            callback={async ({ id, token }) => {
                // manually update token (cringe) // todo: remove, there has to be a better way
                state.nonsense.pluralkit = new PKAPI({
                    token: token as string,
                });

                if (
                    id != "" &&
                    (await state.nonsense.getPkSystem(id as string)) ===
                        undefined
                ) {
                    modalController.push({
                        type: "notify",
                        title: "Invalid ID",
                        content: "PluralKit system not found",
                    });
                    return;
                }

                settings.set("nonsense:system:id", id as string);
                settings.set("nonsense:system:token", token as string);
            }}
            submit={{
                children: <Text id="app.special.modals.actions.save" />,
            }}
        />
    );
}
