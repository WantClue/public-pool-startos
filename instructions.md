# Public Pool

## Documentation

- [Public Pool upstream README](https://github.com/benjamin-wilson/public-pool#readme) — the upstream project page, with background on the pool and protocol.

## What you get on StartOS

- A **Web UI** interface — the Public Pool dashboard for watching workers, hashrate, and block discoveries.
- A **Stratum Server** interface on TCP port 3333 — the endpoint your mining hardware points at.
- Bitcoin Core auto-wired as a dependency: RPC over the cookie file and ZMQ block notifications are configured for you, so you do not edit `.env`.

## Getting set up

1. Install Bitcoin Core first. Public Pool requires it and will run the **Auto Configure** task on Bitcoin Core to enable ZMQ before it can start.
2. Install Public Pool. It will start automatically once Bitcoin Core is running and ZMQ is enabled.
3. Open the **Configure** action and set:
   - **Pool Identifier** — the string that appears in your coinbase transactions (default `Public-Pool`).
   - **Server Display URL** — which of the Stratum interface's addresses to show on the dashboard as the connection URL for miners.
4. Point your mining hardware at the Stratum server. See **Connecting miners** below — on StartOS today the Stratum port needs a one-time host-level forward.

## Using Public Pool

### Web UI

Open the **Web UI** interface from the service page. The dashboard shows pool hashrate, your workers, recent blocks found, and the configured Stratum display URL miners should use.

### Configure action

Run **Configure** whenever you want to change the coinbase pool identifier or pick a different Stratum display URL (for example after adding a new clearnet or LAN address to the Stratum interface).

### Connecting miners

Miners must reach the Stratum server over raw TCP on port 3333, not over HTTP or Tor. Use the LAN IP of your StartOS device as the Stratum host, not its `.local` or `.onion` address.

## Limitations

StartOS does not yet forward non-HTTP ports for service interfaces, so the Stratum TCP port (3333) is not reachable from your LAN out of the box. Until native support lands, set up a one-time host-level forward:

1. SSH into your StartOS device and switch to root.

   ```
   sudo -i
   ```

2. Enter the persistent chroot so the changes survive reboots.

   ```
   /usr/lib/startos/scripts/chroot-and-upgrade
   ```

3. Install `simpleproxy`.

   ```
   apt update && apt install simpleproxy -y
   ```

4. Create a systemd unit that forwards LAN TCP 3333 to the Public Pool container.

   ```
   cat > /lib/systemd/system/simpleproxy.stratum.service <<'EOL'
   [Unit]
   Description=simpleproxy stratum forward
   Wants=podman.service
   After=podman.service

   [Service]
   Type=simple
   Restart=always
   RestartSec=3
   ExecStartPre=/bin/bash -c "/bin/systemctl set-environment IP=$(ip route | grep default | awk '{print $9}' | head -1)"
   ExecStart=/usr/bin/simpleproxy -L ${IP}:3333 -R public-pool.embassy:3333

   [Install]
   WantedBy=multi-user.target
   EOL
   ```

5. Enable the unit and exit the chroot. The `exit` triggers a reboot — type it, do not close the SSH session.

   ```
   systemctl enable simpleproxy.stratum
   exit
   ```

After the reboot, miners can connect to `stratum+tcp://<your-startos-lan-ip>:3333`.
