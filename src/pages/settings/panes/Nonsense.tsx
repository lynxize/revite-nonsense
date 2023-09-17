import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";

import {CategoryButton, Checkbox, Column} from "@revoltchat/ui";

import {useApplicationState} from "../../../mobx/State";
import {modalController} from "../../../controllers/modals/ModalController";

export const Nonsense = observer(() => {

    const settings = useApplicationState().settings;

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
                    value = { settings.get("nonsense:enabled")! }
                    description="Enable the Thing"
                    onChange={(state) => settings.set("nonsense:enabled", state)}
                />
                <Checkbox
                    title="Latch"
                    value = { settings.get("nonsense:latch")! }
                    description="Enable latch mode"
                    onChange={(state) => settings.set("nonsense:latch", state)}
                />
            </Column>
        </div>
    );
});
