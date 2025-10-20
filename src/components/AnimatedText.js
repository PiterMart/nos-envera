import { motion } from 'framer-motion';

const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const letter = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

const AnimatedText = ({ text, variant = 'h1', sx = {} }) => {
  // Split the text by words, then map each word to animated letters
  const words = text.split(' ');

	return (
		<motion.div
			variants={sentence}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.5 }}
			style={sx}
		>
			{(() => {
				const Tag = variant;
				return (
					<Tag
						style={{
							...sx,
							whiteSpace: 'normal',
							wordWrap: 'break-word',
							overflowWrap: 'break-word',
							lineHeight: 1.25,
						}}
					>
						{words.map((word, wordIndex) => (
							<span key={wordIndex} style={{ display: 'inline-block', marginRight: '0.5rem' }}>
								{word.split('').map((char, index) => (
									<motion.span
										key={index}
										variants={letter}
										style={{ display: 'inline-block' }}
									>
										{char}
									</motion.span>
								))}
							</span>
						))}
					</Tag>
				);
			})()}
		</motion.div>
	);
};

export default AnimatedText;
