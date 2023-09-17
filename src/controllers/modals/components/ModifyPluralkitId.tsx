import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";
import {useApplicationState} from "../../../mobx/State";

/**
 * Modify PluralKit ID modal
 */
export default function ModifyPluralkitId({
    ...props
}: ModalProps<"modify_pkid">) {
    const settings = useApplicationState().settings;

    return (
        <ModalForm
            {...props}
            title="Set PluralKit System ID"
            schema={{
                pluralkit_id: "text",
            }}
            defaults={{
                pluralkit_id: settings.get("nonsense:systemid"),
            }}
            data={{
                pluralkit_id: {
                    field: "System ID",
                },
            }}
            callback={async ({pluralkit_id}) =>
                settings.set("nonsense:systemid", pluralkit_id as string)
            }
            submit={{
                children: <Text id="app.special.modals.actions.save" />,
            }}
        />
    );
}
