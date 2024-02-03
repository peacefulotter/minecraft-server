export const PROTOCOL_VERSION = 47 as const
export const MINECRAFT_SERVER_VERSION = '1.8.9' as const
export const WELCOME_MESSAGE = 'Welcome to the server!' as const
export const IMAGE =
    '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'

export const HANDSHAKE_RESPONSE = Buffer.from(
    JSON.stringify({
        version: {
            name: MINECRAFT_SERVER_VERSION,
            protocol: PROTOCOL_VERSION,
        },
        players: {
            max: 69,
            online: 42,
        },
        description: {
            text: WELCOME_MESSAGE,
        },
        // favicon: `data:image/png;base64,${IMAGE}`,
    })
)

export const mojangPublicKeyPem =
    '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAylB4B6m5lz7jwrcFz6Fd\n/fnfUhcvlxsTSn5kIK/2aGG1C3kMy4VjhwlxF6BFUSnfxhNswPjh3ZitkBxEAFY2\n5uzkJFRwHwVA9mdwjashXILtR6OqdLXXFVyUPIURLOSWqGNBtb08EN5fMnG8iFLg\nEJIBMxs9BvF3s3/FhuHyPKiVTZmXY0WY4ZyYqvoKR+XjaTRPPvBsDa4WI2u1zxXM\neHlodT3lnCzVvyOYBLXL6CJgByuOxccJ8hnXfF9yY4F0aeL080Jz/3+EBNG8RO4B\nyhtBf4Ny8NQ6stWsjfeUIvH7bU/4zCYcYOq4WrInXHqS8qruDmIl7P5XXGcabuzQ\nstPf/h2CRAUpP/PlHXcMlvewjmGU6MfDK+lifScNYwjPxRo4nKTGFZf/0aqHCh/E\nAsQyLKrOIYRE0lDG3bzBh8ogIMLAugsAfBb6M3mqCqKaTMAf/VAjh5FFJnjS+7bE\n+bZEV0qwax1CEoPPJL1fIQjOS8zj086gjpGRCtSy9+bTPTfTR/SJ+VUB5G2IeCIt\nkNHpJX2ygojFZ9n5Fnj7R9ZnOM+L8nyIjPu3aePvtcrXlyLhH/hvOfIOjPxOlqW+\nO5QwSFP4OEcyLAUgDdUgyW36Z5mB285uKW/ighzZsOTevVUG2QwDItObIV6i8RCx\nFbN2oDHyPaO5j1tTaBNyVt8CAwEAAQ==\n-----END PUBLIC KEY-----'
