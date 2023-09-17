import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";
import {useApplicationState} from "../../../mobx/State";
import {PKAPI} from "pkapi.js";

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
                    field: "Token (Optional)"
                }
            }}
            callback={async ({id, token}) => {
                settings.set("nonsense:system:id", id as string);
                settings.set("nonsense:system:token", token as string)

                // manually update token (cringe) // todo: remove
                state.nonsense.pluralkit = new PKAPI({token: (token as string)})
            }}
            submit={{
                children: <Text id="app.special.modals.actions.save" />,
            }}
        />
    );
}
