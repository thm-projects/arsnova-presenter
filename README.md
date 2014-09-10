# ARSnova Presenter

ARSnova is a web-based Audience Response System which allows you to get instant
feedback from your students. It helps you to get a better understanding about
the learning progress of your students and to identify topics which might need
to be discussed in more detail.

Presenter is an ARSnova frontend for lecturers intended to be used for
preparation and presentation of ARSnova sessions. It focuses on modern didactic
concepts, especially Peer Instruction. But it can still be used for quick and
simple surveys.

In contrast to [ARSnova Mobile](https://github.com/thm-projects/arsnova-mobile),
Presenter targets desktop browsers. It is designed to be totally compatible with
the mobile frontend.

Presenter is [Open Source](COPYING) software. If you are a developer, interested
in didactics and want to help us making it even better, you might also want to
take a look at the [information for contributors](CONTRIBUTING.md).

## Install

Presenter is provided packaged as a web archive file (.war) which can be
deployed on a Java servlet container. Usually it is enough to copy this file to
the webapps directory of the container. Since Presenter does not contain any
code that has to be run on the server side, it is also possible to use it with a
standard web server. In this case extract the contents of the .war file with an
archiving tool of your choice.

Presenter depends on the ARSnova API which is provided by
[ARSnova Backend](https://github.com/thm-projects/arsnova-backend). Refer to its
own documentation for installation steps. In case you intent to run Presenter on
a different (sub)domain than the backend, you need to setup the backend for
cross-origin resource sharing (CORS).

## License

GPLv3 or later, see [COPYING](COPYING) file
