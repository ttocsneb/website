---
name: GemCaps
socials:
- name: Github
  dest: https://github.com/ttocsneb/gemcaps
  icon: fab fa-github
---

Gemcaps is an optimized server for the [gemini protocol][gemini]. I hope to
make this software easy to configure, but also highly configurable.

The gemini protocol aims to be simple and unextensible. I like that, however,
I want to have servers be extensible. I t would be nice to have a central
server that acts as a proxy to other servers in the same domain. To allow the
central server to cache pages to allow for quicker response times. Along with
so much more.

#### Dependencies

GemCaps depends on [libuv][libuv]: An asynchronous multiplatform library that 
handles system calls for you. It is the same library used by NodeJS. This 
allows me to write low level optimized code that works on all architectures.

Another dependency of GemCaps is [YAML-cpp][yaml], which I'm using for
reading/writing configuration files.

[gemini]: https://gemini.circumlunar.space/
[libuv]: https://libuv.org/
[yaml]: https://github.com/jbeder/yaml-cpp/