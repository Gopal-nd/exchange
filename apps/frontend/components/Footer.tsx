import React from 'react'
import { LogoIcon } from './icons/LogoIcon'
import { footerSections, socialLinks } from '@/types'

const Footer = () => {
    return (
        <div className="bg-base-background-l1 py-8">
            <div className="mx-auto w-full max-w-7xl px-6">
                <div className='flex justify-between space-x-8 w-full'>
                    <div className="flex w-fit flex-col">
                        <div className='flex flex-row h-[24px] items-center gap-2.5'>
                            <LogoIcon />
                            <p className="font-extrabold text-white text-lg">Backpack</p>
                        </div>

                    </div>
                    <div className='grid grid-cols-5 gap-x-8 text-xs'>
                        {footerSections.map((section) => (
                            <div key={section.title} className="flex flex-col gap-2">
                                {section.title && (
                                    <p className="text-high-emphasis text-xs">{section.title}</p>
                                )}

                                {section.links.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="text-med-emphasis hover:text-low-emphasis text-xs"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        ))}

                        {/* Social Links */}
                        <div className="flex items-start">
                            <div className="flex gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.href}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent-blue hover:text-med-emphasis"
                                    >
                                        <img
                                            src={social.icon}
                                            alt={social.alt}
                                            width={social.size}
                                            height={social.size}
                                            loading="lazy"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-row items-center">
                    <p className="mr-4 text-xs text-high-emphasis">
                        Backpack Exchange © 2026
                    </p>

                    <div className="flex flex-row gap-4">
                        <a
                            href="https://support.backpack.exchange/legal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-med-emphasis hover:text-low-emphasis"
                        >
                            Legal
                        </a>

                        <a
                            href="https://support.backpack.exchange/articles/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-med-emphasis hover:text-low-emphasis"
                        >
                            Privacy
                        </a>
                    </div>
                </div>


            </div>
        </div>
    )
}

export default Footer