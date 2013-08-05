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
4. Instant image uploading just in the editor, through **drag and drop**.
5. The simple interface, I love this, thought you may like it.

![snapshot](images/snapshot.png)


## Thanks to

MeT is built upon latest web technologies, from many open source projects.

1. CodeMirror.
2. marked.
3. Zepto.


## TODO

MeT is under active development.

1. More test coverage, there are still known bugs.
2. Performance improvement.
3. ~~File lists~~.
4. ~~Implement simple content observer mechanism~~.
5. ~~Image uploading with DnD~~.
6. ~~Status line to show words, lines etc~~.
7. Spell checking, and auto-completion.
8. Editing history, version system.
9. Better editing layout with configurations.
10. Sync with server, with encryption.
11. Online document share.
12. Sync to other blogging or publishing platforms.
13. Improve uploading stability and usability.
14. Store uploaded file lists.
