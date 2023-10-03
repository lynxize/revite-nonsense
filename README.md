# Revite - Nonsense

Modified version of [Revite](https://github.com/revoltchat/revite), the web client for [Revolt](https://revolt.chat/), adding [PluralKit](https://pluralkit.me/)-like message proxying through the use of Revolt's Masquerade feature.

## FAQ
### Why is everything called Nonsense?
Uh, I suck at names, okay? Suggestions are definitely welcome.

### Why not a Plugin?
Revite's plugin API is very much incomplete, and isn't exactly... usable. As far as I know, this likely won't change, as the Revolt frontend is being rewritten. 

Also, I have almost no experience with TypeScript and any sort of frontend work in general, so modifying the base code is just plain easier. It's not like Revite is getting major frequent updates anyway, so it should be straightforward to keep up to date.

### Can I join the same servers?
Yes! This is 100% just a client, it uses the same, standard Revolt backend. All the necessary features to make this work already exist in the normal backend.

Plus, everything is toggleable and disabled by default, so you can use it as if it was normal Revite.

### How do I use it?
You can run it yourself, just like normal Revite, or use the hosted instance [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ).
The settings menu should be pretty self-explanatory.

You can disable message masquerades per-server by navigating to the Server Identity settings. 

### Why am I getting `MISSINGPERMISSION` when I try to send a message?
You need to have the "Masquerade" permission in order for it to work.

### Why is there the occasional hitch/delay when sending a message?
Blame the PluralKit api. There's probably some better things we can do on the client, so feel free to take a look!

### Future plans?
- Add i18n support for all the additions, as currently everything is just raw strings.
- Add some sort of `pk;sw` replacement.
- Maybe find a way to hack together settings sync
- Eventually, once the Revolt client rewrite is usable, port to it.  

Help/contributions appreciated!

## Quick Start

Get Revite up and running locally.

```
git clone --recursive https://github.com/lynxize/revite-nonsense
cd revite
git submodule init
git submodule update
yarn
yarn build:deps
yarn dev
```

## License
Revite is licensed under the [GNU Affero General Public License v3.0](https://github.com/revoltchat/revite/blob/master/LICENSE).
