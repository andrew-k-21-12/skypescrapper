% Clear all variables, close all figures, clear the terminal screen.
clear; close all; clc

% Configs.
DATA_FILE         = "./out/statuses.csv";
MIN_TICK_INTERVAL = 10 * 60 * 1000;       % 10 mins is a minimal distance between horizontal ticks

% Reading all fetched statuses.
fd_data = fopen(DATA_FILE);
data    = textscan(fd_data, "%s,%u8,%u64", "Delimiter", ',');
fclose(fd_data);

% Getting data slices.
data_usernames  = data{1};
data_statuses   = data{2};
data_timestamps = data{3};

% Drawing an activity graph per each user.
for unique_username = unique(data_usernames)'

    % Fetching all data per user.
    user_indices            = find(strcmp(data_usernames, unique_username));
    user_statuses           = data_statuses(user_indices);
    user_timestamps         = data_timestamps(user_indices);
    user_timestamps_online  = user_timestamps(user_statuses == 1);
    user_timestamps_offline = user_timestamps(user_statuses == 2);
    user_timestamps_failed  = user_timestamps(user_statuses == 0);

    % Drawing a graph without horizontal ticks.
    figure
    hold on
    scatter(user_timestamps_online,  repmat(1, length(user_timestamps_online),  1), 2, 'g', 's', "filled");
    scatter(user_timestamps_offline, repmat(1, length(user_timestamps_offline), 1), 1, 'y', 's', "filled");
    scatter(user_timestamps_failed,  repmat(1, length(user_timestamps_failed),  1), 2, 'r', 's', "filled");
    hold off
    title(unique_username);
    xlabel("Date, time");
    ylabel("Status");
    set(gca, "xtick", []);
    set(gca, "xticklabel", []);

    % Drawing time ticks (horizontal ones).
    last_status    = -1;
    last_timestamp = -1;
    for user_index = 1:length(user_indices)
        current_status    = user_statuses(user_index);
        current_timestamp = user_timestamps(user_index);
        % Drawing a tick only if the last status has changed and required time interval is reached.
        if (current_status != last_status && current_timestamp - last_timestamp > MIN_TICK_INTERVAL)
            tick_label = strftime("%d.%m %H:%M", localtime(current_timestamp / 1000));
            text(current_timestamp, 1, tick_label, "rotation", 90, "horizontalalignment", "right", "fontsize", 11);
            last_timestamp = current_timestamp;
        endif
        last_status = current_status;
    endfor

endfor

% Keeping graphs on the screen.
pause
