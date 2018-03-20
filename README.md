Did this

npm install -g browserify


Do this before packaging extension

    mkdir -p coffee-to-js-output &&\
    coffee --compile --output coffee-to-js-output *.coffee &&\
    browserify main.js > bundle.js &&\
    node coffee-to-js-output/calculate-timecards.js &&\
    echo "yay."

The last node command runs some tests.
