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
        this.pluralkit = new PKAPI({token: this.state.settings.get("nonsense:system:token") ?? ""});
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
        if (!this.state.settings.get("nonsense:enabled") || (this.state.settings.get("nonsense:system:id") ?? "") == "") {
            return [{},content];
        }

        if (this.state.settings.get("nonsense:proxy:escape") && content.startsWith("\\")) {
            return [{}, content.substring(1).trim()];
        }

        const systemId = this.state.settings.get("nonsense:system:id")!;
        const system = await this.getPkSystem(systemId)!;

        for (const memberId of system.members!.keys()) {
            const member = await this.getPkMember(memberId);
            const c = this.matchesTag(content, member.proxy_tags);
            if (c !== undefined) {
                this.lastPkMemberId = member.id;
                return [{
                    name: member.name,
                    avatar: member.avatar_url
                },c.trim()];
            }
        }

        // didn't match tags, try latch
        const latch = this.state.settings.get("nonsense:proxy:latch");
        const front = this.state.settings.get("nonsense:proxy:front");
        if (latch && !front && this.lastPkMemberId !== undefined) {
            const member = await this.getPkMember(this.lastPkMemberId);
            {
                return [{
                    name: member.name,
                    avatar: member.avatar_url
                },content];
            }
        }

        // ok, finally try front
        if (front) {
            // manually get the system, because who knows how old the cache is
            // todo: remove this once we have an expiring cache
            const sw = await this.pluralkit.getFronters({system: systemId});
            console.log(sw)
            // I'm new to TypeScript, but even so, this feels bad.
            // todo: cleanup
            let mem: Member | undefined;
            if (sw.members?.values() !== undefined) { // terrible way to check types
                mem = (sw.members as Map<string, Member>).values().next().value;
            } else {
                mem = await this.getPkMember((sw.members as string[])[0]);
            }
            if (mem !== undefined) {
                return [{
                    name: mem.name,
                    avatar: mem.avatar_url
                }, content];
            }
        }

        // give up :(
        return [{},content];
    }

    /***
     @return content, with the tag removed if a tag was matched.
     */
     matchesTag(content: string, tags: ProxyTag[] | undefined): string | undefined {
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
