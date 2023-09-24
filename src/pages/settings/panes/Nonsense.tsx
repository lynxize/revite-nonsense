import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";

import { CategoryButton, Checkbox, Column } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import { modalController } from "../../../controllers/modals/ModalController";

export const Nonsense = observer(() => {
    const s = useApplicationState();

    return (
        // todo: figure out why this settings page has no header
        // and why it looks slightly shifted vertically.
        // It's probably some css thing I don't understand.
        <div className={styles.options}>
            <Column>
                <h3>{"Global Options"}</h3>
                <CategoryButton
                    onClick={() =>
                        modalController.push({ type: "modify_pk_sys" })
                    }
                    action="chevron"
                    description={"Set PluralKit System ID"}>
                    PluralKit ID
                </CategoryButton>
                <CategoryButton
                    description={"Clear PK Member Cache"}
                    onClick={() => {
                        s.nonsense.pkMemberCache.flushAll();
                        s.nonsense.pkSystemCache.flushAll();
                        modalController.push({
                            type: "notify",
                            title: "Success",
                            content: "PluralKit cache cleared",
                        });
                    }}>
                    Clear Cache
                </CategoryButton>
                <Checkbox
                    title="Enable Nonsense"
                    value={s.settings.get("nonsense:enabled")!}
                    description="Enable Message Masquerades"
                    onChange={(state) =>
                        s.settings.set("nonsense:enabled", state)
                    }
                />
                <h3>{"Proxy Settings"}</h3>
                <Checkbox
                    title="Latch Mode"
                    value={s.settings.get("nonsense:proxy:latch")!}
                    description="Masquerade messages with the last used member by default"
                    onChange={(state) =>
                        s.settings.set("nonsense:proxy:latch", state)
                    }
                />
                <Checkbox
                    title="Front Mode"
                    value={s.settings.get("nonsense:proxy:front")!}
                    description="Masquerade messages with the current fronter by default (Overrides latch)"
                    onChange={(state) =>
                        s.settings.set("nonsense:proxy:front", state)
                    }
                />
                <Checkbox
                    title="Backslash Escape"
                    value={s.settings.get("nonsense:proxy:escape")!}
                    description="Type \ before a message to not masquerade"
                    onChange={(state) =>
                        s.settings.set("nonsense:proxy:escape", state)
                    }
                />
            </Column>
        </div>
    );
});
