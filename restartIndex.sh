source /etc/enviornment
sudo forever stop index.js
sudo OPENAI_KEY=$OPENAI_KEY forever start index.js