import type { AvailableLanguageTag } from "../../lib/paraglide/runtime"
import type { ParaglideLocals } from "@inlang/paraglide-sveltekit"
declare global {
	namespace App {
		interface Locals {
    paraglide: ParaglideLocals<AvailableLanguageTag>,

			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
