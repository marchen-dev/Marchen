'use client'

import type { ChartConfig } from '@marchen/components/ui'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  MarchenCard,
} from '@marchen/components/ui'
import { useMemo } from 'react'
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { useDashboardData } from '../hooks/use-dashboard'

export const DashboardStatistics = () => {
  return (
    <section className="mt-10 grid w-full grid-cols-1 gap-9 md:grid-cols-2">
      <RequestChart />
      {/* <ReadChart /> */}
    </section>
  )
}

export const RequestChart = () => {
  const dashboardData = useDashboardData()
  // 对访问数据进行处理，按天进行分组并计数
  const chartData = useMemo(() => {
    const dayVisits: Record<string, number> = {}

    dashboardData.analyze?.forEach((item) => {
      const day = item.created.split('T')[0]

      if (!dayVisits[day]) {
        dayVisits[day] = 0
      }

      dayVisits[day] += 1
    })

    const last7Days: string[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      // 格式化日期为 YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0]
      last7Days.push(formattedDate)
    }

    // 为每一天创建数据点，如果没有访问记录则设为0
    return last7Days.map((day) => {
      const dateObj = new Date(day)
      const month = dateObj.getMonth() + 1
      const date = dateObj.getDate()
      const formattedDay = `${month}/${date}`

      const rawVisits = dayVisits[day] || 0
      const normalizedVisits = Math.min(rawVisits, 1000)

      return {
        day,
        displayDay: formattedDay,
        visits: normalizedVisits,
        rawVisits,
      }
    })
  }, [dashboardData])

  const maxVisits = useMemo(() => {
    const values = chartData.map((item) => item.visits)
    const max = Math.max(...values)

    if (max === 0) return 10

    return Math.min(Math.ceil(max), 1000)
  }, [chartData])

  const chartConfig: ChartConfig = {
    visits: {
      label: '访问量',
      color: '#3b82f6', // 靛蓝色
    },
  }

  const yAxisTicks = useMemo(() => {
    const tickCount = 5
    const max = maxVisits * 1.2
    const ticks = []

    for (let i = 0; i <= tickCount; i++) {
      ticks.push(Math.floor((max * i) / tickCount))
    }

    return ticks
  }, [maxVisits])
  return (
    <div className="w-full ">
      <h2 className="font-medium">API 调用统计</h2>

      <MarchenCard className="mt-3">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="displayDay"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                domain={[0, Math.ceil(maxVisits * 1.2)]}
                ticks={yAxisTicks}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="visits"
                type="monotone"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: '#3b82f6',
                  strokeWidth: 2,
                  stroke: '#ffffff',
                }}
                activeDot={{
                  r: 6,
                  fill: '#3b82f6',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              >
                <LabelList
                  dataKey="visits"
                  position="top"
                  offset={10}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number, entry: any) => {
                    if (value <= 0) return ''
                    const rawValue = entry?.payload?.rawVisits
                    return rawValue && rawValue > 1000
                      ? '1000+'
                      : Math.floor(value)
                  }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </MarchenCard>
    </div>
  )
}

// const ReadChart = () => {
//   const dashboardData = useDashboardData()

//   const { chart } = useMemo(() => {
//     // 筛选出以 /posts 开头并且路径段数大于等于4的项
//     const postData = dashboardData.analyze.filter(
//       (item) =>
//         item.path.startsWith('/posts') && item.path.split('/').length >= 4,
//     )

//     // 统计每个 path 的出现次数
//     const pathCount: Record<string, number> = {}
//     postData.forEach((item) => {
//       if (!pathCount[item.path]) {
//         pathCount[item.path] = 0
//       }
//       pathCount[item.path] += 1
//     })

//     // 转换为数组并按出现次数排序
//     const sortedPaths = Object.entries(pathCount)
//       .map(([path, count]) => ({ path, count }))
//       .sort((a, b) => b.count - a.count)

//     let chart = []
//     if (sortedPaths.length > 4) {
//       const top4 = sortedPaths.slice(0, 4)
//       chart = [...top4]

//       // 计算其他项的总访问次数
//       const otherCount = sortedPaths
//         .slice(4)
//         .reduce((sum, item) => sum + item.count, 0)
//       chart.push({ path: '其他', count: otherCount })
//     } else {
//       chart = sortedPaths
//     }

//     return {
//       chart,
//     }
//   }, [dashboardData])

//   // 为图表创建合适的数据格式
//   const pieChartData = useMemo(() => {
//     return chart.map((item, index) => {
//       // 创建由浅蓝到深蓝的颜色渐变
//       const blueColors = [
//         '#e6f2ff', // 最浅的蓝色
//         '#b3d9ff',
//         '#80c1ff',
//         '#4da6ff',
//         '#0080ff', // 最深的蓝色
//       ]

//       return {
//         path: item.path,
//         visitors: item.count,
//         fill: blueColors[index % blueColors.length],
//       }
//     })
//   }, [chart])

//   const chartConfig: ChartConfig = {
//     visitors: {
//       label: '访问量',
//       color: '#3b82f6',
//     },
//   }
//   return (
//     <div className="w-full">
//       <h2 className="font-medium">文章阅读统计</h2>
//       <MarchenCard className="mt-3">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
//         >
//           <PieChart>
//             <ChartTooltip content={<ChartTooltipContent hideLabel />} />
//             <Pie data={pieChartData} dataKey="visitors" label nameKey="path" />
//             <ChartLegend
//               content={<ChartLegendContent nameKey="path" />}
//               className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
//             />
//           </PieChart>
//         </ChartContainer>
//       </MarchenCard>
//     </div>
//   )
// }
