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
