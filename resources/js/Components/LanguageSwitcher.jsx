import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Listbox, Transition } from "@headlessui/react";

export default function LanguageSwitcher({ currentLocale, availableLocales }) {
    const [isOpen, setIsOpen] = useState(false);
    const { post } = useForm();

    const localeNames = {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        id: "Indonesia",
    };

    const localeFlags = {
        en: "🇬🇧",
        es: "🇪🇸",
        fr: "🇫🇷",
        de: "🇩🇪",
        id: "🇮🇩",
    };

    const handleLanguageChange = (locale) => {
        post(
            route("language.switch"),
            {
                locale: locale,
            },
            {
                preserveScroll: true,
                onSuccess: () => window.location.reload(),
            }
        );
    };

    return (
        <div className="relative">
            <Listbox value={currentLocale} onChange={handleLanguageChange}>
                <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-pointer">
                    <span className="flex items-center">
                        <span className="mr-2">
                            {localeFlags[currentLocale]}
                        </span>
                        <span className="block truncate">
                            {localeNames[currentLocale]}
                        </span>
                    </span>
                </Listbox.Button>

                <Transition
                    show={isOpen}
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                >
                    <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto bg-white rounded-md shadow-lg max-h-60">
                        {availableLocales.map((locale) => (
                            <Listbox.Option
                                key={locale}
                                value={locale}
                                className={({ active }) =>
                                    `${
                                        active
                                            ? "text-white bg-indigo-600"
                                            : "text-gray-900"
                                    }
                                    cursor-pointer select-none relative py-2 pl-10 pr-4`
                                }
                            >
                                {({ selected, active }) => (
                                    <>
                                        <span className="flex items-center">
                                            <span className="mr-2">
                                                {localeFlags[locale]}
                                            </span>
                                            <span
                                                className={`block truncate ${
                                                    selected
                                                        ? "font-medium"
                                                        : "font-normal"
                                                }`}
                                            >
                                                {localeNames[locale]}
                                            </span>
                                        </span>
                                        {selected && (
                                            <span
                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                    active
                                                        ? "text-white"
                                                        : "text-indigo-600"
                                                }`}
                                            >
                                                <CheckIcon
                                                    className="w-5 h-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        )}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </Listbox>
        </div>
    );
}

function CheckIcon(props) {
    return (
        <svg {...props} viewBox="0 0 20 20" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}
