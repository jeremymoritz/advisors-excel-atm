## Questions

### What issues, if any, did you find with the existing code?

The out-of-the-box database configuration in `docker-compose.yml` was incorrect (showing `init.sql` instead of `init-db.sql`), so this needed to be fixed in order to build properly. Also, the README file says that it should run using two steps. The first step is listed as `docker run build`, but it actually needed `docker-compose build` instead.

### What issues, if any, did you find with the request to add functionality?

I tried to add Jest testing, but I kept running into an issue with `SyntaxError: Cannot use import statement outside a module` regarding material UI. I tried adding `@babel/preset-env` and `ts-jest` and several other things, but it wasn't working properly. At this point, if i were on a team I would've solicited the help of others to see if there was something i was missing, but since it wasn't in the requirements for this project I trudged on ahead without Unit tests. I'm very interested to know if anyone else found a way to successfully include Jest tests that could render the components in a test environment.

### Would you modify the structure of this project if you were to start it over? If so, how?

Overall, i thought it was a nice structure. I like that it is running in Docker and all of the code is easily accessible. If i were modifying it for a different potential hire, I would probably include some styling elements to ensure that the candidate knows how to write custom CSS if needed.

### Were there any pieces of this project that you were not able to complete that you'd like to mention?

I think I completed all of the requirements.

### If you were to continue building this out, what would you like to add next?

Add better and more responsive styling, server-side validation, secure authentication, accessibility improvements (such as keyboard-only navigation and aria labels) and some SVG images.

### If you have any other comments or info you'd like the reviewers to know, please add them below.

I appreciate the care Michael took to make this project. It was a fun one to do, and I look forward to meeting you all soon to discuss it!
