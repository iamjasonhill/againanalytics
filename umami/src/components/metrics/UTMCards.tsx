import { useMessages, useWebsiteMetrics } from '@/components/hooks';
import { GridRow } from '@/components/layout/Grid';
import ListTable from '@/components/metrics/ListTable';

interface UTMCardsProps {
  websiteId: string;
  limit?: number;
}

export function UTMCards({ websiteId, limit = 5 }: UTMCardsProps) {
  const { formatMessage, labels } = useMessages();
  const { data: sourceData } = useWebsiteMetrics(websiteId, { type: 'utm_source', limit });
  const { data: mediumData } = useWebsiteMetrics(websiteId, { type: 'utm_medium', limit });
  const { data: campaignData } = useWebsiteMetrics(websiteId, { type: 'utm_campaign', limit });
  const { data: contentData } = useWebsiteMetrics(websiteId, { type: 'utm_content', limit });
  const { data: termData } = useWebsiteMetrics(websiteId, { type: 'utm_term', limit });

  const groups = [
    { key: 'utm_source', title: labels.sources, data: sourceData },
    { key: 'utm_medium', title: labels.medium, data: mediumData },
    { key: 'utm_campaign', title: labels.campaigns, data: campaignData },
    { key: 'utm_content', title: labels.content, data: contentData },
    { key: 'utm_term', title: labels.terms, data: termData },
  ] as const;

  const hasData = groups.some(({ data }) => Array.isArray(data) && data.some(result => result?.x));

  if (!hasData) {
    return null;
  }

  return (
    <GridRow columns="three">
      {groups.map(({ key, title, data }) => {
        const rows =
          (data as { x: string; y: number }[] | undefined)?.filter(item => item?.x) ?? [];

        if (rows.length === 0) {
          return null;
        }

        const total = rows.reduce((sum, { y }) => sum + Number(y || 0), 0);
        const values = rows
          .sort((a, b) => Number(b.y) - Number(a.y))
          .slice(0, limit)
          .map(({ x, y }) => ({
            x: x || formatMessage(labels.unknown),
            y: Number(y),
            z: total ? (Number(y) / total) * 100 : 0,
          }));

        if (values.length === 0) {
          return null;
        }

        const heading = title ? formatMessage(title) : key.replace('utm_', '');

        return (
          <ListTable
            key={key}
            title={heading}
            metric={formatMessage(labels.visitors)}
            data={values}
          />
        );
      })}
    </GridRow>
  );
}

export default UTMCards;
