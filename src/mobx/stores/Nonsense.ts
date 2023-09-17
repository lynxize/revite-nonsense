import {Member, PKAPI, ProxyTag, System} from "pkapi.js";
import {Masquerade} from "revolt-api";
import State from "../State";

export default class Nonsense {
    private state: State;

    // note: actual configuration settings are in Settings
    // this exists mostly just as access for pk stuff:tm:

    pluralkit: PKAPI;
    lastPkMemberId: string | undefined;
    // todo: replace with an actual cache
    pkMemberCache: Map<string, Member>;
    pkSystemCache: Map<string, System>;

    constructor(state: State) {
        this.state = state;
        this.pluralkit = new PKAPI();
        this.pkMemberCache = new Map<string, Member>();
        this.pkSystemCache = new Map<string, System>();
    }

    async getPkMember(id: string): Promise<Member> {
        if (this.pkMemberCache.has(id)) {
            return this.pkMemberCache.get(id)!;
        }

        const member = this.pluralkit.getMember({member: id});
        this.pkMemberCache.set(id, await member);
        return member;
    }

    async getPkSystem(id: string): Promise<System> {
        if (!this.pkSystemCache.has(id)) {
            const system = await this.pluralkit.getSystem({system:id});

            // ensure system has members, sometimes it won't, but we need
            // to be able to iterate over them, so fetch them manually
            system.members = await this.pluralkit.getMembers({system:id});
            for (const [id, member] of system.members) {
                this.pkMemberCache.set(id, member);
            }

            this.pkSystemCache.set(id, system);
        }
        return this.pkSystemCache.get(id)!;
    }

    async getMasquerade(content: string): Promise<[Masquerade, string]> {
        if (!this.state.settings.get("nonsense:enabled") || (this.state.settings.get("nonsense:systemid") ?? "") == "") {
            return [{},content];
        }

        const system = await this.getPkSystem(this.state.settings.get("nonsense:systemid")!)!;

        for (const memberId of system.members!.keys()) {
            const member = await this.getPkMember(memberId);
            const c = this.matchesTag(content, member.proxy_tags);
            if (c !== undefined) {
                this.lastPkMemberId = member.id;
                return [{
                    name: member.name,
                    avatar: member.avatar_url
                },c];
            }
        }

        // didn't match tags, try latch
        const latch = this.state.settings.get("nonsense:latch");
        if (latch && this.lastPkMemberId !== undefined) {
            const member = await this.getPkMember(this.lastPkMemberId);
            {
                return [{
                    name: member.name,
                    avatar: member.avatar_url
                },content];
            }
        }

        return [{},content];
    }

     matchesTag(content: string, tags: ProxyTag[] | undefined): string | undefined {
        if (tags == undefined) {
            return undefined;
        }
        for (const tag of tags) {
            if (content.startsWith(tag.prefix) || content.endsWith(tag.suffix)) {
                // todo: properly strip prefix
                return content.replace(tag.prefix, "").replace(tag.suffix, "");
            }
        }

        return undefined;
    }
}
