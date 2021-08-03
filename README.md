## WHAT IS IT?

This is a small program allowing to periodically fetch online statuses
(check if a user is online) 
of your contacts in Skype.
If your mom says that data stalking (even very minor one) is bad,
please close this page immediately.


## HOW TO RUN STATUSES FETCHING


### PREREQUISITES CONFIGURATION

The program was tested only in macOS Catalina 10.15.6 and Ubuntu 20.04. 
There are no guarantees that it will work in other operating systems
(or even in those mentioned above 😂). 
To make it work anyway, the following dependencies should be installed:

1. [**Node.js v14.15.4**](https://nodejs.org) - 
this version (and **v14.16.0** also) was used for testing.
Maybe other versions will work too,
but it's better to prefer fresh versions
to make all ES6 features work.

2. **NPM 6.14.10** - 
guess almost every version will do,
but this is the one was used for testing.

3. Execute `npm i` inside of the root folder of this repo
(on the same level with this README.md)
to fetch all Node.js dependencies.

4. The following dependencies were required by Puppeteer
to be installed on clean Ubuntu 20.04:
```
sudo apt install libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon-x11-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm-dev libgtk-3-0 libxshmfence1 libx11-xcb1
```


### SCRAPPER CONFIGURATION

There are no strict requirements to create config files.
It's up to you to launch the scrapper without any configs.
In this case the program will ask you 
to provide required logins and other stuff,
or default values will be used.

But if you want to simplify your life,
the following `configs.json` can be placed 
in the same directory with this README.md:
```
{
    "debug":             false,
    "check_interval_ms": 300000,
    "interactive":       false,
    "credentials": {
        "login":    "login",
        "password": "password"
    },
    "targets": [ "username_1", "username_2", "username_3" ],
    "refresh_on_iteration": 5
}
```

These configs have the following impacts:
- `debug`: runs Chromium in the headful mode when enabled;
- `check_interval_ms`: how often (in milliseconds) the statuses will be fetched;
- `interactive`: whether the scrapper should be launched in the manual mode;
- `credentials`: your Skype login and password;
- `targets`: Skype usernames to fetch the statuses of (should be in your contacts);
- `refresh_on_iteration`: page refreshing will be done every n-th iteration set in this config
(to reduce excessive RAM usage, yeah - Chromium is very greedy).

Some of the configs above (`check_interval_ms`, `targets`, `refresh_on_iteration`) 
can be updated on-the-go 
meaning that it will be immediately applied on save in the running scrapper.


### STARTING EXECUTION

Most likely you're going to launch the scrapper on some remote server.
In this case it's inevitable that Skype will ask you to confirm your email
(because a connection from a new server will look suspicious for him obviously).
Use interactive mode to select and confirm your email.
Maybe one day I'll add some automation to do that, but I'm too lazy for this now.

When Skype starts to trust your server (poor boy),
we are ready to switch to automatic mode.
If you use some Linux system (e.g. Ubuntu),
make sure to set your system language to English:
```
LANG=en_US.UTF-8
```

This is required to be done on each session before starting the scrapper
(because Chromium doesn't support `--lang` option in Linux systems).

Execute `npm start`, provide required configs if needed
and wait for statuses logs to appear in the `./out` folder.
Don't run `npm start` under root - most likely it will not work.

If you launch the scrapper in a remote server 
and want to make sure that it will not stop working
when you disconnect from SSH, do the following:
- press **ctrl** + **z** to pause the currently launched process;
- execute **bg** to resume this process in the background;
- execute **disown -h** to keep the process running when you detach from SSH.
You can see your background procces running with 
`jobs` or `ps -ef | grep node` commands.


### TROUBLESHOOTING

If you launch the scrapper for the first time,
and it can not login with your credentials,
most likely Skype prevents himself from working on unfamiliar machine.
Enable `debug` config or use interactive mode in this case.

In the case of any wrong behavior from Puppeteer
(e.g. hanging on opening of a new page),
it's helpful to run it with `dumpio: true`.


## HOW TO VISUALISE FETCHED STATUSES LOGS FOR ANALYSIS

This scrapper saves statuses logs in the CSV format:
```
username,status,timestamp
```

- `username`: username in Skype;
- `status`: 0 - failed to fetch, 1 - online, 2 - offline;
- `timestramp`: unixtime milliseconds.

This format should be convenient to process and visualise the data.
See `./scripts` folder to check out applicable processing scripts
for [GNU Octave](https://www.gnu.org/software/octave).

If you don't change the path to the statuses log,
it's even simplier to visualise the data with `npm run visualise`
(make sure you have [GNU Octave installed](https://www.gnu.org/software/octave/download)).


## FINITA LA COMMEDIA

After running this scrapper for about 3 weeks without interruptions
Skype blocks your account and requires you to change your password.
That means these scripts are not very viable, but it was at least fun to write them.
