import { z } from 'zod';
export declare const ThemeColorsSchema: z.ZodObject<{
    primary: z.ZodString;
    background: z.ZodString;
    surface: z.ZodString;
    textDark: z.ZodString;
    textMuted: z.ZodString;
    white: z.ZodString;
}, "strip", z.ZodTypeAny, {
    primary: string;
    background: string;
    surface: string;
    textDark: string;
    textMuted: string;
    white: string;
}, {
    primary: string;
    background: string;
    surface: string;
    textDark: string;
    textMuted: string;
    white: string;
}>;
export declare const ThemeConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    colors: z.ZodObject<{
        primary: z.ZodString;
        background: z.ZodString;
        surface: z.ZodString;
        textDark: z.ZodString;
        textMuted: z.ZodString;
        white: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primary: string;
        background: string;
        surface: string;
        textDark: string;
        textMuted: string;
        white: string;
    }, {
        primary: string;
        background: string;
        surface: string;
        textDark: string;
        textMuted: string;
        white: string;
    }>;
    fontHeading: z.ZodEnum<["serif", "sans"]>;
    fontBody: z.ZodEnum<["sans", "serif"]>;
    backgroundEffect: z.ZodEnum<["floating_hearts", "sparkles", "gentle_bokeh", "none"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    colors: {
        primary: string;
        background: string;
        surface: string;
        textDark: string;
        textMuted: string;
        white: string;
    };
    fontHeading: "serif" | "sans";
    fontBody: "serif" | "sans";
    backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
}, {
    id: string;
    name: string;
    colors: {
        primary: string;
        background: string;
        surface: string;
        textDark: string;
        textMuted: string;
        white: string;
    };
    fontHeading: "serif" | "sans";
    fontBody: "serif" | "sans";
    backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
}>;
export declare const SceneInteractionSchema: z.ZodObject<{
    type: z.ZodEnum<["next_button", "evasive_no", "open_gift", "reveal_text", "shuffle_compliment"]>;
    primaryButtonText: z.ZodOptional<z.ZodString>;
    secondaryButtonText: z.ZodOptional<z.ZodString>;
    evasiveMessages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    revealDelayMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
    primaryButtonText?: string | undefined;
    secondaryButtonText?: string | undefined;
    evasiveMessages?: string[] | undefined;
    revealDelayMs?: number | undefined;
}, {
    type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
    primaryButtonText?: string | undefined;
    secondaryButtonText?: string | undefined;
    evasiveMessages?: string[] | undefined;
    revealDelayMs?: number | undefined;
}>;
export declare const SceneConfigSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["greeting", "suspense", "question", "evasive_choice", "letter", "celebration", "gift_box", "compliments"]>;
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    bodyText: z.ZodOptional<z.ZodString>;
    badge: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    mediaUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    interaction: z.ZodObject<{
        type: z.ZodEnum<["next_button", "evasive_no", "open_gift", "reveal_text", "shuffle_compliment"]>;
        primaryButtonText: z.ZodOptional<z.ZodString>;
        secondaryButtonText: z.ZodOptional<z.ZodString>;
        evasiveMessages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        revealDelayMs: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
        primaryButtonText?: string | undefined;
        secondaryButtonText?: string | undefined;
        evasiveMessages?: string[] | undefined;
        revealDelayMs?: number | undefined;
    }, {
        type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
        primaryButtonText?: string | undefined;
        secondaryButtonText?: string | undefined;
        evasiveMessages?: string[] | undefined;
        revealDelayMs?: number | undefined;
    }>;
    order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
    id: string;
    title: string;
    interaction: {
        type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
        primaryButtonText?: string | undefined;
        secondaryButtonText?: string | undefined;
        evasiveMessages?: string[] | undefined;
        revealDelayMs?: number | undefined;
    };
    order: number;
    subtitle?: string | undefined;
    bodyText?: string | undefined;
    badge?: string | undefined;
    icon?: string | undefined;
    mediaUrl?: string | undefined;
}, {
    type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
    id: string;
    title: string;
    interaction: {
        type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
        primaryButtonText?: string | undefined;
        secondaryButtonText?: string | undefined;
        evasiveMessages?: string[] | undefined;
        revealDelayMs?: number | undefined;
    };
    order: number;
    subtitle?: string | undefined;
    bodyText?: string | undefined;
    badge?: string | undefined;
    icon?: string | undefined;
    mediaUrl?: string | undefined;
}>;
export declare const MusicConfigSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    trackId: z.ZodOptional<z.ZodString>;
    trackTitle: z.ZodOptional<z.ZodString>;
    trackUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    trackId?: string | undefined;
    trackTitle?: string | undefined;
    trackUrl?: string | undefined;
}, {
    enabled: boolean;
    trackId?: string | undefined;
    trackTitle?: string | undefined;
    trackUrl?: string | undefined;
}>;
export declare const ExperienceConfigSchema: z.ZodObject<{
    creatorName: z.ZodString;
    recipientName: z.ZodString;
    title: z.ZodString;
    theme: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        colors: z.ZodObject<{
            primary: z.ZodString;
            background: z.ZodString;
            surface: z.ZodString;
            textDark: z.ZodString;
            textMuted: z.ZodString;
            white: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            background: string;
            surface: string;
            textDark: string;
            textMuted: string;
            white: string;
        }, {
            primary: string;
            background: string;
            surface: string;
            textDark: string;
            textMuted: string;
            white: string;
        }>;
        fontHeading: z.ZodEnum<["serif", "sans"]>;
        fontBody: z.ZodEnum<["sans", "serif"]>;
        backgroundEffect: z.ZodEnum<["floating_hearts", "sparkles", "gentle_bokeh", "none"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        colors: {
            primary: string;
            background: string;
            surface: string;
            textDark: string;
            textMuted: string;
            white: string;
        };
        fontHeading: "serif" | "sans";
        fontBody: "serif" | "sans";
        backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
    }, {
        id: string;
        name: string;
        colors: {
            primary: string;
            background: string;
            surface: string;
            textDark: string;
            textMuted: string;
            white: string;
        };
        fontHeading: "serif" | "sans";
        fontBody: "serif" | "sans";
        backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
    }>;
    music: z.ZodObject<{
        enabled: z.ZodBoolean;
        trackId: z.ZodOptional<z.ZodString>;
        trackTitle: z.ZodOptional<z.ZodString>;
        trackUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        trackId?: string | undefined;
        trackTitle?: string | undefined;
        trackUrl?: string | undefined;
    }, {
        enabled: boolean;
        trackId?: string | undefined;
        trackTitle?: string | undefined;
        trackUrl?: string | undefined;
    }>;
    scenes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["greeting", "suspense", "question", "evasive_choice", "letter", "celebration", "gift_box", "compliments"]>;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        bodyText: z.ZodOptional<z.ZodString>;
        badge: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        mediaUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        interaction: z.ZodObject<{
            type: z.ZodEnum<["next_button", "evasive_no", "open_gift", "reveal_text", "shuffle_compliment"]>;
            primaryButtonText: z.ZodOptional<z.ZodString>;
            secondaryButtonText: z.ZodOptional<z.ZodString>;
            evasiveMessages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            revealDelayMs: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
            primaryButtonText?: string | undefined;
            secondaryButtonText?: string | undefined;
            evasiveMessages?: string[] | undefined;
            revealDelayMs?: number | undefined;
        }, {
            type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
            primaryButtonText?: string | undefined;
            secondaryButtonText?: string | undefined;
            evasiveMessages?: string[] | undefined;
            revealDelayMs?: number | undefined;
        }>;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
        id: string;
        title: string;
        interaction: {
            type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
            primaryButtonText?: string | undefined;
            secondaryButtonText?: string | undefined;
            evasiveMessages?: string[] | undefined;
            revealDelayMs?: number | undefined;
        };
        order: number;
        subtitle?: string | undefined;
        bodyText?: string | undefined;
        badge?: string | undefined;
        icon?: string | undefined;
        mediaUrl?: string | undefined;
    }, {
        type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
        id: string;
        title: string;
        interaction: {
            type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
            primaryButtonText?: string | undefined;
            secondaryButtonText?: string | undefined;
            evasiveMessages?: string[] | undefined;
            revealDelayMs?: number | undefined;
        };
        order: number;
        subtitle?: string | undefined;
        bodyText?: string | undefined;
        badge?: string | undefined;
        icon?: string | undefined;
        mediaUrl?: string | undefined;
    }>, "many">;
    complimentsList: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    creatorName: string;
    recipientName: string;
    theme: {
        id: string;
        name: string;
        colors: {
            primary: string;
            background: string;
            surface: string;
            textDark: string;
            textMuted: string;
            white: string;
        };
        fontHeading: "serif" | "sans";
        fontBody: "serif" | "sans";
        backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
    };
    music: {
        enabled: boolean;
        trackId?: string | undefined;
        trackTitle?: string | undefined;
        trackUrl?: string | undefined;
    };
    scenes: {
        type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
        id: string;
        title: string;
        interaction: {
            type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
            primaryButtonText?: string | undefined;
            secondaryButtonText?: string | undefined;
            evasiveMessages?: string[] | undefined;
            revealDelayMs?: number | undefined;
        };
        order: number;
        subtitle?: string | undefined;
        bodyText?: string | undefined;
        badge?: string | undefined;
        icon?: string | undefined;
        mediaUrl?: string | undefined;
    }[];
    complimentsList?: string[] | undefined;
}, {
    title: string;
    creatorName: string;
    recipientName: string;
    theme: {
        id: string;
        name: string;
        colors: {
            primary: string;
            background: string;
            surface: string;
            textDark: string;
            textMuted: string;
            white: string;
        };
        fontHeading: "serif" | "sans";
        fontBody: "serif" | "sans";
        backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
    };
    music: {
        enabled: boolean;
        trackId?: string | undefined;
        trackTitle?: string | undefined;
        trackUrl?: string | undefined;
    };
    scenes: {
        type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
        id: string;
        title: string;
        interaction: {
            type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
            primaryButtonText?: string | undefined;
            secondaryButtonText?: string | undefined;
            evasiveMessages?: string[] | undefined;
            revealDelayMs?: number | undefined;
        };
        order: number;
        subtitle?: string | undefined;
        bodyText?: string | undefined;
        badge?: string | undefined;
        icon?: string | undefined;
        mediaUrl?: string | undefined;
    }[];
    complimentsList?: string[] | undefined;
}>;
export declare const SharingModeSchema: z.ZodEnum<["public_link", "partner_exclusive"]>;
export declare const ExperienceCreateSchema: z.ZodObject<{
    templateId: z.ZodString;
    title: z.ZodString;
    recipientName: z.ZodString;
    creatorName: z.ZodString;
    config: z.ZodObject<{
        creatorName: z.ZodString;
        recipientName: z.ZodString;
        title: z.ZodString;
        theme: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            colors: z.ZodObject<{
                primary: z.ZodString;
                background: z.ZodString;
                surface: z.ZodString;
                textDark: z.ZodString;
                textMuted: z.ZodString;
                white: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            }, {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            }>;
            fontHeading: z.ZodEnum<["serif", "sans"]>;
            fontBody: z.ZodEnum<["sans", "serif"]>;
            backgroundEffect: z.ZodEnum<["floating_hearts", "sparkles", "gentle_bokeh", "none"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        }, {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        }>;
        music: z.ZodObject<{
            enabled: z.ZodBoolean;
            trackId: z.ZodOptional<z.ZodString>;
            trackTitle: z.ZodOptional<z.ZodString>;
            trackUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        }, {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        }>;
        scenes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["greeting", "suspense", "question", "evasive_choice", "letter", "celebration", "gift_box", "compliments"]>;
            title: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            bodyText: z.ZodOptional<z.ZodString>;
            badge: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            mediaUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            interaction: z.ZodObject<{
                type: z.ZodEnum<["next_button", "evasive_no", "open_gift", "reveal_text", "shuffle_compliment"]>;
                primaryButtonText: z.ZodOptional<z.ZodString>;
                secondaryButtonText: z.ZodOptional<z.ZodString>;
                evasiveMessages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                revealDelayMs: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            }, {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            }>;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }, {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }>, "many">;
        complimentsList: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    }, {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    }>;
    sharingMode: z.ZodDefault<z.ZodEnum<["public_link", "partner_exclusive"]>>;
    recipientId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    creatorName: string;
    recipientName: string;
    templateId: string;
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    sharingMode: "public_link" | "partner_exclusive";
    recipientId?: string | null | undefined;
}, {
    title: string;
    creatorName: string;
    recipientName: string;
    templateId: string;
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    sharingMode?: "public_link" | "partner_exclusive" | undefined;
    recipientId?: string | null | undefined;
}>;
export declare const PartnerExclusiveSurpriseSchema: z.ZodEffects<z.ZodObject<{
    templateId: z.ZodString;
    title: z.ZodString;
    recipientName: z.ZodString;
    creatorName: z.ZodString;
    config: z.ZodObject<{
        creatorName: z.ZodString;
        recipientName: z.ZodString;
        title: z.ZodString;
        theme: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            colors: z.ZodObject<{
                primary: z.ZodString;
                background: z.ZodString;
                surface: z.ZodString;
                textDark: z.ZodString;
                textMuted: z.ZodString;
                white: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            }, {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            }>;
            fontHeading: z.ZodEnum<["serif", "sans"]>;
            fontBody: z.ZodEnum<["sans", "serif"]>;
            backgroundEffect: z.ZodEnum<["floating_hearts", "sparkles", "gentle_bokeh", "none"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        }, {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        }>;
        music: z.ZodObject<{
            enabled: z.ZodBoolean;
            trackId: z.ZodOptional<z.ZodString>;
            trackTitle: z.ZodOptional<z.ZodString>;
            trackUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        }, {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        }>;
        scenes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["greeting", "suspense", "question", "evasive_choice", "letter", "celebration", "gift_box", "compliments"]>;
            title: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            bodyText: z.ZodOptional<z.ZodString>;
            badge: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            mediaUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            interaction: z.ZodObject<{
                type: z.ZodEnum<["next_button", "evasive_no", "open_gift", "reveal_text", "shuffle_compliment"]>;
                primaryButtonText: z.ZodOptional<z.ZodString>;
                secondaryButtonText: z.ZodOptional<z.ZodString>;
                evasiveMessages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                revealDelayMs: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            }, {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            }>;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }, {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }>, "many">;
        complimentsList: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    }, {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    }>;
    sharingMode: z.ZodDefault<z.ZodEnum<["public_link", "partner_exclusive"]>>;
    recipientId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    creatorName: string;
    recipientName: string;
    templateId: string;
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    sharingMode: "public_link" | "partner_exclusive";
    recipientId?: string | null | undefined;
}, {
    title: string;
    creatorName: string;
    recipientName: string;
    templateId: string;
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    sharingMode?: "public_link" | "partner_exclusive" | undefined;
    recipientId?: string | null | undefined;
}>, {
    title: string;
    creatorName: string;
    recipientName: string;
    templateId: string;
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    sharingMode: "public_link" | "partner_exclusive";
    recipientId?: string | null | undefined;
}, {
    title: string;
    creatorName: string;
    recipientName: string;
    templateId: string;
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    sharingMode?: "public_link" | "partner_exclusive" | undefined;
    recipientId?: string | null | undefined;
}>;
export declare const ExperiencePublishSchema: z.ZodObject<{
    experienceId: z.ZodString;
    config: z.ZodObject<{
        creatorName: z.ZodString;
        recipientName: z.ZodString;
        title: z.ZodString;
        theme: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            colors: z.ZodObject<{
                primary: z.ZodString;
                background: z.ZodString;
                surface: z.ZodString;
                textDark: z.ZodString;
                textMuted: z.ZodString;
                white: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            }, {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            }>;
            fontHeading: z.ZodEnum<["serif", "sans"]>;
            fontBody: z.ZodEnum<["sans", "serif"]>;
            backgroundEffect: z.ZodEnum<["floating_hearts", "sparkles", "gentle_bokeh", "none"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        }, {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        }>;
        music: z.ZodObject<{
            enabled: z.ZodBoolean;
            trackId: z.ZodOptional<z.ZodString>;
            trackTitle: z.ZodOptional<z.ZodString>;
            trackUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        }, {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        }>;
        scenes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["greeting", "suspense", "question", "evasive_choice", "letter", "celebration", "gift_box", "compliments"]>;
            title: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            bodyText: z.ZodOptional<z.ZodString>;
            badge: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            mediaUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            interaction: z.ZodObject<{
                type: z.ZodEnum<["next_button", "evasive_no", "open_gift", "reveal_text", "shuffle_compliment"]>;
                primaryButtonText: z.ZodOptional<z.ZodString>;
                secondaryButtonText: z.ZodOptional<z.ZodString>;
                evasiveMessages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                revealDelayMs: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            }, {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            }>;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }, {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }>, "many">;
        complimentsList: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    }, {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    }>;
    sharingMode: z.ZodOptional<z.ZodEnum<["public_link", "partner_exclusive"]>>;
    recipientId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    experienceId: string;
    sharingMode?: "public_link" | "partner_exclusive" | undefined;
    recipientId?: string | null | undefined;
}, {
    config: {
        title: string;
        creatorName: string;
        recipientName: string;
        theme: {
            id: string;
            name: string;
            colors: {
                primary: string;
                background: string;
                surface: string;
                textDark: string;
                textMuted: string;
                white: string;
            };
            fontHeading: "serif" | "sans";
            fontBody: "serif" | "sans";
            backgroundEffect: "floating_hearts" | "sparkles" | "gentle_bokeh" | "none";
        };
        music: {
            enabled: boolean;
            trackId?: string | undefined;
            trackTitle?: string | undefined;
            trackUrl?: string | undefined;
        };
        scenes: {
            type: "greeting" | "suspense" | "question" | "evasive_choice" | "letter" | "celebration" | "gift_box" | "compliments";
            id: string;
            title: string;
            interaction: {
                type: "next_button" | "evasive_no" | "open_gift" | "reveal_text" | "shuffle_compliment";
                primaryButtonText?: string | undefined;
                secondaryButtonText?: string | undefined;
                evasiveMessages?: string[] | undefined;
                revealDelayMs?: number | undefined;
            };
            order: number;
            subtitle?: string | undefined;
            bodyText?: string | undefined;
            badge?: string | undefined;
            icon?: string | undefined;
            mediaUrl?: string | undefined;
        }[];
        complimentsList?: string[] | undefined;
    };
    experienceId: string;
    sharingMode?: "public_link" | "partner_exclusive" | undefined;
    recipientId?: string | null | undefined;
}>;
export declare const ProfileUpdateSchema: z.ZodObject<{
    displayName: z.ZodString;
    avatarUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    displayName: string;
    avatarUrl?: string | undefined;
}, {
    displayName: string;
    avatarUrl?: string | undefined;
}>;
export declare const RecipientResponseSchema: z.ZodObject<{
    experienceId: z.ZodString;
    responseType: z.ZodEnum<["yes", "custom_note"]>;
    responseValue: z.ZodString;
}, "strip", z.ZodTypeAny, {
    experienceId: string;
    responseType: "yes" | "custom_note";
    responseValue: string;
}, {
    experienceId: string;
    responseType: "yes" | "custom_note";
    responseValue: string;
}>;
export declare const PartnerCodeSchema: z.ZodString;
export declare const SendPartnerInvitationSchema: z.ZodObject<{
    target: z.ZodString;
}, "strip", z.ZodTypeAny, {
    target: string;
}, {
    target: string;
}>;
export declare const RespondPartnerInvitationSchema: z.ZodObject<{
    invitationId: z.ZodString;
    decision: z.ZodEnum<["accept", "decline"]>;
}, "strip", z.ZodTypeAny, {
    invitationId: string;
    decision: "accept" | "decline";
}, {
    invitationId: string;
    decision: "accept" | "decline";
}>;
export declare const SendLoveNoteSchema: z.ZodObject<{
    content: z.ZodString;
    tag: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    tag?: string | undefined;
}, {
    content: string;
    tag?: string | undefined;
}>;
export declare const LoveNotesQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    beforeTimestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    beforeTimestamp?: string | undefined;
}, {
    limit?: number | undefined;
    beforeTimestamp?: string | undefined;
}>;
export declare const RegisterPushTokenSchema: z.ZodObject<{
    token: z.ZodString;
    platform: z.ZodEnum<["ios", "android", "web"]>;
}, "strip", z.ZodTypeAny, {
    token: string;
    platform: "ios" | "android" | "web";
}, {
    token: string;
    platform: "ios" | "android" | "web";
}>;
export declare const NotificationPreferencesSchema: z.ZodObject<{
    partnerInvitations: z.ZodDefault<z.ZodBoolean>;
    loveNotes: z.ZodDefault<z.ZodBoolean>;
    surprises: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    partnerInvitations: boolean;
    loveNotes: boolean;
    surprises: boolean;
}, {
    partnerInvitations?: boolean | undefined;
    loveNotes?: boolean | undefined;
    surprises?: boolean | undefined;
}>;
export declare const RelationshipLabelSchema: z.ZodEnum<["partner", "friend", "parent", "sibling", "child", "mentor", "colleague", "family", "other"]>;
export declare const CreatePersonSchema: z.ZodObject<{
    displayName: z.ZodString;
    relationshipLabel: z.ZodDefault<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    avatarEmoji: z.ZodDefault<z.ZodString>;
    linkedAccountId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    displayName: string;
    relationshipLabel: string;
    avatarEmoji: string;
    notes?: string | undefined;
    linkedAccountId?: string | undefined;
}, {
    displayName: string;
    relationshipLabel?: string | undefined;
    notes?: string | undefined;
    avatarEmoji?: string | undefined;
    linkedAccountId?: string | undefined;
}>;
export declare const OccasionCategorySchema: z.ZodEnum<["birthday", "anniversary", "milestone", "celebration", "custom"]>;
export declare const OccasionRecurrenceSchema: z.ZodEnum<["annual", "none"]>;
export declare const CreateImportantDateSchema: z.ZodEffects<z.ZodObject<{
    personId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodDefault<z.ZodEnum<["birthday", "anniversary", "milestone", "celebration", "custom"]>>;
    title: z.ZodString;
    month: z.ZodNumber;
    day: z.ZodNumber;
    year: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    recurrence: z.ZodDefault<z.ZodEnum<["annual", "none"]>>;
    reminderEnabled: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    category: "celebration" | "birthday" | "anniversary" | "milestone" | "custom";
    month: number;
    day: number;
    recurrence: "none" | "annual";
    reminderEnabled: boolean;
    notes?: string | undefined;
    personId?: string | null | undefined;
    year?: number | null | undefined;
}, {
    title: string;
    month: number;
    day: number;
    notes?: string | undefined;
    personId?: string | null | undefined;
    category?: "celebration" | "birthday" | "anniversary" | "milestone" | "custom" | undefined;
    year?: number | null | undefined;
    recurrence?: "none" | "annual" | undefined;
    reminderEnabled?: boolean | undefined;
}>, {
    title: string;
    category: "celebration" | "birthday" | "anniversary" | "milestone" | "custom";
    month: number;
    day: number;
    recurrence: "none" | "annual";
    reminderEnabled: boolean;
    notes?: string | undefined;
    personId?: string | null | undefined;
    year?: number | null | undefined;
}, {
    title: string;
    month: number;
    day: number;
    notes?: string | undefined;
    personId?: string | null | undefined;
    category?: "celebration" | "birthday" | "anniversary" | "milestone" | "custom" | undefined;
    year?: number | null | undefined;
    recurrence?: "none" | "annual" | undefined;
    reminderEnabled?: boolean | undefined;
}>;
export declare const PlanStatusSchema: z.ZodEnum<["planned", "completed"]>;
export declare const CreatePersonalPlanSchema: z.ZodObject<{
    personId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    occasionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodString;
    plannedDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    placeName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    activity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    giftIdea: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodDefault<z.ZodEnum<["planned", "completed"]>>;
}, "strip", z.ZodTypeAny, {
    status: "planned" | "completed";
    title: string;
    notes?: string | null | undefined;
    personId?: string | null | undefined;
    occasionId?: string | null | undefined;
    plannedDate?: string | null | undefined;
    placeName?: string | null | undefined;
    activity?: string | null | undefined;
    giftIdea?: string | null | undefined;
}, {
    title: string;
    status?: "planned" | "completed" | undefined;
    notes?: string | null | undefined;
    personId?: string | null | undefined;
    occasionId?: string | null | undefined;
    plannedDate?: string | null | undefined;
    placeName?: string | null | undefined;
    activity?: string | null | undefined;
    giftIdea?: string | null | undefined;
}>;
export declare const UsernameSchema: z.ZodString;
export declare const EmailOtpRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const EmailOtpVerifySchema: z.ZodObject<{
    email: z.ZodString;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    email: string;
}, {
    token: string;
    email: string;
}>;
export declare const EmailPasswordSignUpSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
}>, {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
}>;
export declare const EmailPasswordLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const PasswordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const UpdatePasswordSchema: z.ZodEffects<z.ZodObject<{
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>;
export declare const UpdateUsernameSchema: z.ZodObject<{
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
}, {
    username: string;
}>;
//# sourceMappingURL=index.d.ts.map