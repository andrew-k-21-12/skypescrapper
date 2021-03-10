% Clear all variables, close all figures, clear the terminal screen.
clear; close all; clc

% Configs.
statuses_file = "./out/statuses.csv";
tick_interval = 30 * 60 * 1000; % 30 mins

% Reading all fetched statuses.
fd       = fopen(statuses_file);
statuses = textscan(fd, "%s,%u8,%u64", "Delimiter", ',');
fclose(fd);

% Looking for unique usernames.
usernames        = statuses{1};
unique_usernames = unique(usernames);

% Preparing time labels to put on plots.
timestamps       = statuses{3};
time_ticks       = [];
time_labels      = repmat(cell, 0);
latest_timestamp = timestamps(1);
for timestamp = timestamps'
	if (timestamp - latest_timestamp > tick_interval)
		latest_timestamp = timestamp;
		time_ticks       = [time_ticks ; timestamp];
		time_labels      = [time_labels ; strftime("%d-%H:%M", localtime(timestamp / 1000))];
	endif
endfor

% Plotting an activity graph per each user.
for unique_username = unique_usernames'
    figure
    username_indices    = find(strcmp(usernames, unique_username));
    username_timestamps = timestamps(username_indices);
    plot(username_timestamps, statuses{2}(username_indices), ".-");
    set(gca, "xtick", time_ticks);
    set(gca, "xticklabel", time_labels);
    title(unique_username);
    xlabel("Day-hour:minute");
    ylabel("Status, 1 - online");
endfor

% Keeping plots on the screen.
pause
