# Sellbot

A sample Express.js app demonstrating various Poynt APIs.

> Note: Sellbot is preserved here as a reference for legacy Poynt Collect users.
> New integrations should use [Unified Checkout](https://developer.godaddy.com/).

## What it demonstrates

The app exposes two flows:

### Link with Poynt - `/link`

Roundtrip flow that sends a customer/merchant from a partner cloud app into the
Poynt processing signup, then receives them back with full access to merchant
info and application status via API.

```
lib/poynt.js              wrapper around the Poynt Node SDK
routes/link.js            serves /link and /link/callback
views/link/index.pug      kicks off the Poynt processing signup flow
views/link/callback.pug   handles the post-signup redirect
```

### Poynt Collect - `/collect`

Embeds a Poynt-hosted credit card form so a partner can tokenize cards and
process payments on behalf of a merchant without taking on PCI scope.

```
public/wallet.js              client-side Apple Pay / Google Pay wallet button
public/css/collect.css        Collect form styles
routes/collect.js             serves /collect and POST /collect/{tokenize,charge}
views/collect/v2.pug          Collect form host page
```

## Running locally

Prerequisites:

1. A reseller organization on Poynt OTE and a cloud app registered against it.
2. The keypair PEM file for that cloud app, saved as `keypair.pem` in the repo
   root.
3. The Poynt public key (PEM) that signs the signup callback `code` JWT, saved
   as `poynt-public.pem` in the repo root (or point `signupTokenPublicKeyFile`
   in `lib/configs.json` elsewhere). `/link/callback` rejects every token until
   this is configured. Optionally set `signupTokenIssuer` to pin the `iss` claim.
4. Update `lib/configs.json` with your `applicationId` and `collectBusinessId`.
   Update the same `applicationId` and `businessId` in `public/wallet.js` if you
   want the wallet button to render.

Then:

```sh
nvm use            # uses the version pinned in .nvmrc
npm install
node index.js      # listens on http://localhost:1347
```

## License

MIT - see [LICENSE](./LICENSE).
