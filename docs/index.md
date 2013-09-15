MeT - The Markdown and LaTeX Editor You Should Have Met
=======================================================

MeT is created as a cross platform Markdown editor, with basic LaTeX math equations support, some additional amazing features included, too.



## Screencast

I'm trying to record a screencast to demonstrate some unique features of MeT, should be available soon.



## Interface

I prefer simple user interface, maybe cause I don't know how to draw and design.


### File list

There're only two white pane by default, but if you move your mouse to the left border of the browser, you get a fully functional file list.

![2013-08-13-153917_2880x1800.png](https://o.repo.io/130813y6HE.png)


### Status line

The Vim like status line can be brought to front by move your mouse to the very bottom of the browser. Click it to dismiss it.


### Image uploading

Drag an image from anywhere to the position where you want the image to be inserted, of course, to the editing area, not the preview area.

![2013-08-13-154228_2880x1800.png](https://o.repo.io/130813jOOZ.png)

And yes, I provide free image uploading service to all MeT users.




## LaTeX math

Inline \(LaTeX\) math \(x^2 + y^2\), and block math

\[\begin{aligned}
x[x := N] & \equiv N \\
y[x := N] & \equiv y, \text{ if } x \neq y \\
(M_1\ M_2)[x := N] & \equiv (M_1[x := N])(M_2[x := N) \\
(\lambda x.M)[x := N] & \equiv \lambda x.M \\
(\lambda y.M)[x := N] & \equiv \lambda y.(M[x := N]), \text{ if } x \neq y, \text{ provided } y \notin FV(N)
\end{aligned}\]




## IndexedDB

Your **each keystroke** is stored in local IndexedDB, this is and experimental HTML5 feature, only Firefox and Chrome support it.

Someday I may add other local storage back-ends beside IndexedDB to support more browsers. But current work is to optimize the IndexedDB performance.

A Firefox sync like function is under consideration.




## Widgets


The modern editor should facilitate the using great Internet products of our era, MeT supports Gist, YouTube and basic Tweet embedding, and more not promising.


### Gist from GitHub

MeT use double `@@` as the widget embedding identifier, just include the full gist URL.

@@https://gist.github.com/vecio/6210604@@


### Tweet

You know, Twitter is not a friendly company to developers, so it's difficult to embed a fancy tweet into MeT. Just simple text based implementation, maybe blocked by Twitter someday.

@@https://twitter.com/cedricfung/status/363698334919168001@@


### YouTube video

Nothing special from the gist.

@@http://www.youtube.com/watch?v=4kUNMbuPw_Q@@




## Roadmap

This project has been developed for about 3 weeks, alongside the [IO](https://i.repo.io). I don't want to attract too many users to MeT, just want to keep improving it for my own use. Something in the roadmap:

- The preview and editor pane sync issue.
- File list, and image uploading bug fix.
- Performance improvement.
- Version and diff feature.
- Spell checking, and auto-completion.
- Configurable layout and theme.
- Sync to server.
- A blog engine based on MeT.
