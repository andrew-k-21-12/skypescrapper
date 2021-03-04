## CONFIGURATION

Create `configs.json` with the following or similar contents:
```
{
    "is_debug":           false,
    "logs_out_file":      "./logs.csv",
    "check_interval":     300000,
    "creds_from_console": true
}
```

Create `credentials.json` with the following or similar contents
if hardcoded credentials are preferred (do it only in your own safe environment):
```
{
    "login":    "login_in_skype",
    "password": "password_in_skype"
}
```

Create `targets.json` with all Skype usernames to be monitored:
```
[ "some_skype_username", "some_skype_pal" ]
```

Install all required dependencies: `npm i`.


## EXECUTION

Fire `npm start` and wait for logs to appear in the configured logs file.

Linux systems don't support `--lang` option for Chromium
so make sure to configure `LANG` instead for your session:
```
LANG=en_US.UTF-8
```

For initial configs (such as bypassing Skype's unusal location security checks)
it's better to use `npm run interactive` manually.


## TO DO

1. Extract workflows, move utility classes into helpers dir.

2. Add prerequisites section (NodeJS 14, NPM, Linux libs) and all other updates here.

3. Add here: Don't run from root! Commands to keep working in the background.

4. Profile everything.

5. Write octave scripts for analysis.
