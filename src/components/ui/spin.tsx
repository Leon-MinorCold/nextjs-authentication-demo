'use client'

import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const spinVariants = cva('animate-spin', {
	variants: {
		size: {
			default: 'h-4 w-4',
			sm: 'h-3 w-3',
			lg: 'h-6 w-6',
			xl: 'h-8 w-8',
			'2xl': 'h-12 w-12',
		},
		color: {
			default: 'text-primary',
			white: 'text-white',
			muted: 'text-muted-foreground',
		},
	},
	defaultVariants: {
		size: 'default',
		color: 'default',
	},
})

export interface SpinProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
		VariantProps<typeof spinVariants> {
	fullscreen?: boolean
	spinning?: boolean
	children?: React.ReactNode
}

const Spin = ({
	className,
	size,
	color,
	fullscreen = false,
	spinning = true,
	children,
	...props
}: SpinProps) => {
	const spinElement = (
		<div role="status" className={cn('flex items-center justify-center', className)} {...props}>
			<Loader2 className={cn(spinVariants({ size, color }))} />
			<span className="sr-only">Loading...</span>
		</div>
	)

	if (fullscreen) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
				{spinElement}
			</div>
		)
	}

	if (children) {
		return (
			<div className="relative">
				{spinning && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] z-10">
						{spinElement}
						<span className="ml-2">Loading...</span>
					</div>
				)}
				<div className={cn(spinning && 'pointer-events-none select-none')}>{children}</div>
			</div>
		)
	}

	return spinElement
}

export { Spin, spinVariants }
