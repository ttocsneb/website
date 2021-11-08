---
title: I've Fallen in Love With Rust
rss_desc: I have decided to switch the language for GemCaps to Rust.
date: Sun, 07 Nov 2021 17:21:19 -0700
uuid: cb486a82-4029-11ec-976a-3dace8931226
---

## What is Rust?

I have heard a lot recently about a language called Rust. I have not been able
to understand why people want to learn such a language--It just has what seems
to be the worst name. Who wants to write in a rusty old language? It turns out
that I have fallen into the trap of reading a book by its cover.

After a while of trying to ignore the language, I have finally decided to take
a peek and see what it's all about. Rust is a relatively new language (I 
believe designed in the early 2010's) as a modern supplement to C. 

This language is a compiled language taht uses a large amount of analysis to 
be able to manage memory for you. Keep in mind that this is not garbage 
collection. Instead, this is essentially inserting _alloc_'s and _free_'s in 
the code where they need to be placed.

I love the idea of having effecient memory allocation without the need of 
thinking about where to put my _free_'s. Now, being able to not have to think
of where to allocate and dealocate memory is nice, but you also need to worry
about who owns the data. This is where the rust compiler really shines. The 
compiler makes sure that you are not doing unsafe with your memory. If you do,
it will tell you that you are doing something wrong.

I love this so much! In the past with gemcaps, I would always run into issues 
of memory leaks or trying to access deallocated memory. The idea of having the
compiler do that for me is just so refreshing.

## What I have so far

Now that I have finished my rant of how good Rust is--I can finally start
talking about my plans for making GemCaps with Rust. Since I haven't yet gotten
a fully working prototype for GemCaps, it won't be too hard to start over from
scratch in this new language. That doesn't mean that it will be smooth sailing
either.

While I have spent several hours learning about the language of Rust (instead 
of doing the homework that I should be doing) there are still very advanced 
things I will need to learn in order to fulfill my plans for GemCaps. I need to
learn the process of the equivelent to _fork_ as well as learning how to allow
for external libraries to influence GemCaps.

These two things aren't required to make a gemini server, so they will be low
on my priorities. For now, the most important thing to work on is making a
working server.

## My plans for GemCaps

1. Allow support for multiple certificates using SNI.
2. Create a site configuration system similar to nginx.
3. Be able to serve files.
4. Allow configuration for client side authentication of files.
