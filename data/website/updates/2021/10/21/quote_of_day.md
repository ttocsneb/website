---
title: Adding Quote of the Day
rss_desc: I added a quote of the day, that gets updated once a day.
date: Thu, 21 Oct 2021 10:12:17 -0600
uuid: a910c6b5-3289-11ec-a935-05ed8007388e
---

Part of the requirements for my web design class is to implement an API to our
website. The website that I am making doesn't seem to have any viable things
that I could make requests to. Sure, I could retreive the weather, but where
should I get the weather from? Maybe I could have a quote of the day.

The website that I am getting quotes from ([quotes.rest][quotes]) has a quote
of the day that I could retrieve. The only problem is that I don't want to make
a request on every page--especially if the quote only changes once a day. So
I've decided to implement cookies to cache the quote of the day.

When a quote is fetched, the quote is stored in a cookie with an expiration of
midnight that night. Now the quote will no longer be fetched until the cookie
expires. I do worry about whether the quote changes at the same time that the
cookie expires. If it doesn't get updated at the same time, then it is possible
that the same quote of the day will be displayed for two days in a row. Further
testing is needed to check if this is possible or common.

[quotes]: https://quotes.rest/