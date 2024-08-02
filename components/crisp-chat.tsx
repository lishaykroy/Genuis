"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("9ece3079-8366-4dc9-8adb-443ea5dbe5e4");
    }, []);

    return null;
}