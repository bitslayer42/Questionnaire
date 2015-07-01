# Questionnaire

Questions and Answers are pulled from a database using a ColdFusion backend, or can be read from a json text file.
Multiple questionnaire forms can be used.
At start up it reads in a form called HOME, which can be a "menu" form, (selecting which other form to load next.)
Sample data in data.json shows the format for questions and answers.
Each Form has multiple questions (QuID) which can be of several types:
header: displays text.
menu: choose name of next form to go to.
text, textarea, checkbox, radio: html foem elements.
text5: question with five answer boxes. (weird, I know.)

After form is filled in, the results are saved to LocalStorage. List Saved Forms button shows all that is saved.


