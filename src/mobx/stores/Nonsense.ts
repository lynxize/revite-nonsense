import { Member, PKAPI, ProxyTag, System } from "pkapi.js";
import { Masquerade } from "revolt-api";

import State from "../State";
import NodeCache from "node-cache";
import {modalController} from "../../controllers/modals/ModalController";

export default class Nonsense {
    private state: State;

    // note: actual configuration settings are in Settings
    // this exists mostly just as access for pk stuff:tm:
    pluralkit: PKAPI;
    lastPkMemberId: string | undefined;
    pkMemberCache: NodeCache;
    pkSystemCache: NodeCache;

    constructor(state: State) {
        this.state = state;
        this.pluralkit = new PKAPI({
            token: this.state.settings.get("nonsense:system:token") ?? "",
        });
        this.pkSystemCache = new NodeCache({
            stdTTL: 30, // rather low for the sake of front mode
        })
        this.pkMemberCache = new NodeCache({
            stdTTL: 120,
        })
    }

    async getPkMember(id: string): Promise<Member | undefined> {
        if (this.pkMemberCache.has(id)) {
            return this.pkMemberCache.get(id)!;
        }
        try {
            const member = this.pluralkit.getMember({ member: id });
            this.pkMemberCache.set(id, await member);
            return member;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    async getPkSystem(id: string): Promise<System | undefined> {
        if (!this.pkSystemCache.has(id)) {
            try {
                const system: System | undefined = (await this.pluralkit.getSystem({
                    system: id,
                    fetch: ["members", "fronters"],
                }).catch(() => {
                    modalController.push({
                        type: "notify",
                        title: "Error",
                        content: "Failed to get PluralKit system. " +
                            "Be sure to enter your token in settings if members or front history are set to private.",
                    });
                    return undefined;
                }));

                // there's probably a more idiomatic way to do this lol
                if (system === undefined) {
                    return undefined;
                }

                for (const [id, member] of system.members!) {
                    this.pkMemberCache.set(id, member);
                }

                this.pkSystemCache.set(id, system);
            } catch (e) {
                console.error(e);
                return undefined;
            }
        }
        return this.pkSystemCache.get(id)!;
    }

    async getMasquerade(serverId: string | undefined, content: string): Promise<[Masquerade|undefined, string]> {
        // initial checks to see if we even should masquerade
        // todo: clean up and move elsewhere
        if (
            !this.state.settings.get("nonsense:enabled") ||
            (this.state.settings.get("nonsense:system:id") ?? "") == "" ||
            (
                serverId !== undefined && this.state.settings.get("nonsense:disabled_servers")?.includes(serverId!)
            )
        ) {
            return [undefined, content];
        }

        if (
            this.state.settings.get("nonsense:proxy:escape") &&
            content.startsWith("\\")
        ) {
            return [undefined, content.substring(1).trim()];
        }

        const systemId = this.state.settings.get("nonsense:system:id")!;
        const system = await this.getPkSystem(systemId);
        if (system == undefined) {
            return [undefined, content]; // not fond of the [undefined, content] spam, there's gotta be a better way
        }

        for (const memberId of system!.members!.keys()) {
            const member = (await this.getPkMember(memberId))!;
            const c = this.matchesTag(content, member.proxy_tags);
            if (c !== undefined) {
                this.lastPkMemberId = member.id;
                return [
                    {
                        name: member.name,
                        avatar: member.avatar_url,
                    },
                    c.trim(),
                ];
            }
        }

        // didn't match tags, try latch
        const latch = this.state.settings.get("nonsense:proxy:latch");
        const front = this.state.settings.get("nonsense:proxy:front");
        if (latch && !front && this.lastPkMemberId !== undefined) {
            const member = (await this.getPkMember(this.lastPkMemberId))!;
            {
                return [
                    {
                        name: member.name,
                        avatar: member.avatar_url,
                    },
                    content,
                ];
            }
        }

        // ok, finally try front
        if (front) {
            const sw = (await this.getPkSystem(systemId))!.fronters!;

            // I'm new to TypeScript, but even so, this feels bad.
            // todo: cleanup
            let mem: Member | undefined;
            if (sw.members?.values() !== undefined) {
                // terrible way to check types
                mem = (sw.members as Map<string, Member>).values().next().value;
            } else {
                mem = await this.getPkMember((sw.members as string[])[0]);
            }

            if (mem !== undefined) {
                return [
                    {
                        name: mem.name,
                        avatar: mem.avatar_url,
                    },
                    content,
                ];
            }
        }

        // give up :(
        return [undefined, content];
    }

    /***
     @return content, with the tag removed if a tag was matched.
     */
    matchesTag(
        content: string,
        tags: ProxyTag[] | undefined,
    ): string | undefined {
        if (tags == undefined) return undefined;

        for (const tag of tags) {
            // this kind of sucks and could be improved
            if (content.startsWith(tag.prefix)) {
                return content.substring(tag.prefix.length);
            }
            if (content.endsWith(tag.suffix)) {
                return content.substring(0, content.length - tag.suffix.length);
            }
        }

        return undefined;
    }
}
