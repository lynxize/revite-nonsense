import { X } from "@styled-icons/boxicons-regular";
import { Save } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useMemo, useState } from "preact/hooks";

import {
    Button,
    Category,
    Centred,
    Column,
    InputBox,
    Modal,
    Row,
    Message, Checkbox,
} from "@revoltchat/ui";

import { noop } from "../../../lib/js";

import { FileUploader } from "../../client/jsx/legacy/FileUploads";
import { ModalProps } from "../types";
import { useApplicationState } from "../../../mobx/State";

const Preview = styled(Centred)`
    flex-grow: 1;
    border-radius: var(--border-radius);
    background: var(--secondary-background);

    > div {
        padding: 0;
    }
`;

export default observer(
    ({ member, ...props }: ModalProps<"server_identity">) => {
        const [nickname, setNickname] = useState(member.nickname ?? "");

        const message: any = useMemo(() => {
            return {
                author: member.user!,
                member: {
                    ...member,
                    nickname,
                },
            };
        }, []);

        const state = useApplicationState();
        const settings = state.settings;

        return (
            <Modal
                {...props}
                title={
                    <Text
                        id={"app.special.popovers.server_identity.title"}
                        fields={{ server: member.server!.name }}
                    />
                }>
                <Column gap="18px">
                    <Column>
                        <Category compact>
                            <Text id="app.special.popovers.server_identity.nickname" />
                        </Category>
                        <Row centred>
                            <InputBox
                                value={nickname}
                                placeholder={member.user!.username}
                                onChange={(e) =>
                                    setNickname(e.currentTarget.value)
                                }
                            />
                            <Button
                                compact="icon"
                                palette="secondary"
                                disabled={
                                    nickname === member.nickname || !nickname
                                }
                                onClick={() => member.edit({ nickname })}>
                                <Save size={24} />
                            </Button>
                            <Button
                                compact="icon"
                                palette="secondary"
                                disabled={!member.nickname}
                                onClick={() =>
                                    member
                                        .edit({ remove: ["Nickname"] })
                                        .then(() => setNickname(""))
                                }>
                                <X size={24} />
                            </Button>
                        </Row>
                    </Column>
                    <Row gap="18px">
                        <Column>
                            <Category compact>
                                <Text id="app.special.popovers.server_identity.avatar" />
                            </Category>
                            <FileUploader
                                width={80}
                                height={80}
                                style="icon"
                                fileType="avatars"
                                behaviour="upload"
                                maxFileSize={4_000_000}
                                onUpload={(avatar) =>
                                    member.edit({ avatar }).then(noop)
                                }
                                remove={() =>
                                    member
                                        .edit({ remove: ["Avatar"] })
                                        .then(noop)
                                }
                                defaultPreview={member.user?.generateAvatarURL(
                                    {
                                        max_side: 256,
                                    },
                                    false,
                                )}
                                previewURL={member.client.generateFileURL(
                                    member.avatar ?? undefined,
                                    { max_side: 256 },
                                    true,
                                )}
                                desaturateDefault
                            />
                        </Column>
                        <Column grow>
                            <Category compact>Preview</Category>
                            <Preview>
                                <Message message={message} head />
                            </Preview>
                        </Column>
                    </Row>
                    <Checkbox
                        title="Disable Nonsense"
                        value={settings.get("nonsense:disabled_servers")?.includes(member.server._id) ?? false}
                        description="Force disable message masquerades in this server"
                        onChange={(state) => {
                            const server = member.server._id;
                            let disabled = settings.get("nonsense:disabled_servers") ?? [];
                            if (state && !disabled.includes(server)) disabled.push(server);
                            else if (!state) {
                                disabled = disabled.filter((id: string) => id !== server);
                            }
                            settings.set("nonsense:disabled_servers", disabled);
                        }}
                    />
                </Column>
            </Modal>
        );
    },
);
