import { useSpring, animated } from '@react-spring/web';
import { Button, Icon } from 'react-basics';
import { useTheme } from '@/components/hooks';
import Icons from '@/components/icons';
import styles from './ThemeButton.module.css';

export function ThemeButton() {
  const { theme, saveTheme } = useTheme();

  const spring = useSpring({
    opacity: 1,
    transform: 'translateY(0px) scale(1.0)',
    from: {
      opacity: 0,
      transform: `translateY(${theme === 'light' ? '20px' : '-20px'}) scale(0.5)`,
    },
  });

  function handleClick() {
    saveTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <Button variant="quiet" className={styles.button} onClick={handleClick}>
      <animated.div style={spring}>
        <Icon>{theme === 'light' ? <Icons.Sun /> : <Icons.Moon />}</Icon>
      </animated.div>
    </Button>
  );
}

export default ThemeButton;
