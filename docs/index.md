MeT - The Markdown and LaTeX Editor You Should Have Met
=======================================================

I'm trying to build a cross-platform markdown editor, with inline \(LaTeX\) support. The goal of this project is a fast document creation tool, and should be accessible from all major operating systems.


## Warranty

This project is under heavy development and not yet be an alpha project, you shouldn't rely it to store your important documents.

Though it's supposed to be reliable at anytime, the content is stored locally with the experimental HTML5 feature `IndexedDB`, I haven't do enough tests to see if all browsers would crash the database in certain situations.


## Features

MeT is designed to be full compatible with markdown specification, extra features included. The \(LaTeX\) math equations should be compatible with the common specification, too.

Below is a partial list of the features that distinguish MeT from other similar projects.

1. Blazingly fast live preview, with increment parsing.
2. Easily sync the preview and editor whenever you scroll or click each part.
3. Available from all popular operating systems, each stroke will be stored in database offline.
4. The simple interface, I love this, thought you may like it.


## Thanks to

MeT is built upon latest web technologies, from many open source projects.

1. CodeMirror.
2. marked.
3. Zepto.


## TODO

MeT is under active development.

1. File lists.
2. Better editing layout with configurations.
3. More test coverage, there are still known bugs.
4. Sync with server, with encryption.
5. Spell checking, and auto-completion.
6. Online document share.
7. Sync to other blogging or publish platforms.
8. Performance improvement.
9. Editing history, version system.
10. Implement simple content observer mechanism.
11. Use CodeMirror lineWidget and CodeMirror drag drop events to upload image.
