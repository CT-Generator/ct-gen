FROM postgres:16-alpine

RUN apk add --no-cache rclone bash tini

COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Minimal cron-like loop — sleep until 03:17 server time, dump, repeat.
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/backup.sh"]
