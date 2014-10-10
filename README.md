# Golfweek App

## Setup

* install [nvm](https://github.com/creationix/nvm)
    * install node version 0.10.x as some of the node modules don't work with v0.11.13
* changed to less as it is easier to setup
* download [lesshat](http://lesshat.madebysource.com/) for mixins (or just use the npm package)
* clone the repository and ```cd golfweek_app```
* run ```npm install``` to install all dependencies
* run ```echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p```
	* this command changes the maximum number of watches that can be set by the user 
* now you are ready to start working
* all of the editing should be done in the src folder _NOT_ the dist folder
* you can view your work with auto reload at localhost:3000
