import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";

import {CategoryButton, Checkbox, Column} from "@revoltchat/ui";

import {useApplicationState} from "../../../mobx/State";
import {modalController} from "../../../controllers/modals/ModalController";
import {ListOl} from "@styled-icons/boxicons-regular";
import {Text} from "preact-i18n";

export const Nonsense = observer(() => {

    const s = useApplicationState();

    // todo: figure out why this settings page has no header

    return (
        <div className={styles.notifications}>
            <Column>
                <CategoryButton
                    onClick={() =>
                        modalController.push({ type: "modify_pkid" })
                    }
                    action="chevron"
                    description={"Set PluralKit System ID"}>
                    PluralKit ID
                </CategoryButton>
                <Checkbox
                    title="Enable Nonsense"
                    value = { s.settings.get("nonsense:enabled")! }
                    description="Enable the Thing"
                    onChange={(state) => s.settings.set("nonsense:enabled", state)}
                />
                <Checkbox
                    title="Latch"
                    value = { s.settings.get("nonsense:latch")! }
                    description="Enable latch mode"
                    onChange={(state) => s.settings.set("nonsense:latch", state)}
                />
                <CategoryButton
                    description={"Clear PK Member Cache"}
                    onClick={() => {
                        s.nonsense.pkMemberCache.clear();
                        s.nonsense.pkSystemCache.clear();
                        modalController.push({
                            type: "notify",
                            title: "Success",
                            content: "PluralKit member cache cleared"
                        });
                    }}>
                    Clear Cache
                </CategoryButton>
            </Column>
        </div>
    );
});
