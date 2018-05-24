# Chatbot Markdown

For businesses and developers to prototype chatbot faster without moving the mouse

# Bot and Human conversation
***
```
- Hi human! I come in peace.
-- Reveal yourself!
```

# Flow 
***
You're familiar with tree diagram. Each branch in the tree is a **flow**.

```
# 1
- Going to second flow

# 2
- Here in second flow
```

# Quick replies
***
This UI element is similar to Facebook messenger.

The syntax is `[button_text]: go_to_flow`.

```
# 1
- Are you ready?
[Yes]: 2
[No]: 3
```

If you type an asterisk at the end of the quick reply, the chat will go to that particular flow

```
# 1
- Which flow would you like to go?
[Second flow]: 2
[Third flow]: 3*

# 2
- Hi from second flow

# 3
- Hi from third flow
```

# Images
***
We kept the original Markdown syntax for images.

```
- ![hedgehog](https://media.boingboing.net/wp-content/uploads/2017/08/hedgie.gif)`
```

# Links
***

```
- Let me recommend a song for you: [Song Title] (https://www.youtube.com/watch?v=OdhTfdG3FHI)
```
